const text=value=>String(value??'').trim();
const cell=value=>text(value)||'待补充';
const list=value=>Array.isArray(value)?value.filter(Boolean):[];
const asArray=value=>list(value).map(item=>typeof item==='object'?item:{text:item});
const terms=value=>list(value).slice(0,5).map(text);
const featureKeys=[['function','功能'],['material','材质'],['color','颜色'],['pattern','图案'],['combination','组合方式'],['size','尺寸/大小'],['pack_quantity','打包数量'],['use_scenarios','使用场景'],['target_audience','定位人群'],['other','其他特征']];
const needRows=(value,prefix)=>asArray(value).slice(0,10).map((item,index)=>({item:`${prefix}${index+1}`,chinese:item.chinese||item.need||item.text||'',english:terms(item.english||item.terms),evidence:item.evidence||item.source||''}));
export function normalizeWorksheet(bundle,listing={}){
 const target=bundle?.target||{},provided=listing?.worksheet||{},attrs=target.attributes||{};
 const providedFeatures=provided.features||{};
 const featureMap=Object.fromEntries(featureKeys.map(([key,label])=>[key,{label,chinese:providedFeatures[key]?.chinese||providedFeatures[key]||'',english:terms(providedFeatures[key]?.english||providedFeatures[key]?.terms)}]));
 if(!featureMap.function.chinese)featureMap.function.chinese=list(target.features).slice(0,2).join('；');
 if(!featureMap.material.chinese)featureMap.material.chinese=target.material||attrs.material||'';
 if(!featureMap.color.chinese)featureMap.color.chinese=attrs.color||'';
 if(!featureMap.size.chinese)featureMap.size.chinese=attrs.product_dimensions||attrs.size||target.capacityOz?`${target.capacityOz||''} oz ${attrs.product_dimensions||attrs.size||''}`.trim():'';
 if(!featureMap.pack_quantity.chinese)featureMap.pack_quantity.chinese=target.packCount&&target.packCount!==1?String(target.packCount):'';
 const needs=needRows(provided.needs,'需求');
 const coreNeeds=needRows(provided.coreNeeds||provided.core_needs,'核心需求');
 const fallbackNeeds=needs.length?needs:list(target.features).slice(0,10).map((x,i)=>({item:`需求${i+1}`,chinese:x,english:[],evidence:'目标商品公开页面 about_product'}));
 const fallbackCore=coreNeeds.length?coreNeeds:fallbackNeeds.map((x,i)=>({...x,item:`核心需求${i+1}`}));
 const competitors=list(bundle?.competitors).slice(0,2);
 const comparison=provided.comparison||{};
 const compRows=featureKeys.map(([key,label])=>({item:label,target:featureMap[key].chinese,competitor1:comparison.competitor1?.[key]||competitors[0]?.attributes?.[key]||'',competitor2:comparison.competitor2?.[key]||competitors[1]?.attributes?.[key]||'',final:comparison.finalNeeds?.[key]||''}));
 const keywordData=provided.keywords||{};
 const evidence=list(bundle?.keywordEvidence).slice(0,30).map(x=>x.keyword);
 return {product:{name:provided.product?.name||target.title,english:terms(provided.product?.english||provided.product?.terms),components:provided.product?.components||'',asin:target.asin,image:target.images?.[0]||'',url:target.source?.amazonUrl||''},features:featureMap,needs:fallbackNeeds,coreNeeds:fallbackCore,comparison:{rows:compRows,targetAsin:target.asin,competitor1:competitors[0]?.asin||'',competitor2:competitors[1]?.asin||'',finalNeeds:list(comparison.finalNeeds||provided.finalNeeds)},keywords:{manual:asArray(keywordData.manual||keywordData.manualMining),tool:asArray(keywordData.tool||keywordData.toolMining),core:asArray(keywordData.core||keywordData.coreKeywords),longTail:asArray(keywordData.longTail||keywordData.long_tail),evidence}};
}
function csvCell(value){return `"${String(value??'').replace(/"/g,'""')}"`}
export function worksheetRows(bundle,listing={}){
 const w=normalizeWorksheet(bundle,listing),rows=[];const add=(section,item,cn,en,comp1='',comp2='',final='')=>rows.push([section,item,cn,en,comp1,comp2,final]);
 add('产品基础','产品是什么',w.product.name,w.product.english.join('；'));add('产品基础','产品组成',w.product.components,'');
 for(const [key,label] of featureKeys){const f=w.features[key];add('产品特征',label,f.chinese,f.english.join('；'));}
 for(const n of w.needs)add('用户需求',n.item,n.chinese,n.english.join('；'));
 for(const n of w.coreNeeds)add('核心需求排序',n.item,n.chinese,n.english.join('；'));
 add('市场需求验证','ASIN',w.comparison.targetAsin,'',w.comparison.competitor1,w.comparison.competitor2,'最终市场需求');
 for(const row of w.comparison.rows)add('市场需求验证',row.item,row.target,'',row.competitor1,row.competitor2,row.final);
 add('关键词完成','人工挖掘',w.keywords.manual.map(x=>x.keyword||x.text).join('；'),'');add('关键词完成','工具挖掘',w.keywords.tool.map(x=>x.keyword||x.text).join('；'),'');add('关键词完成','核心关键词',w.keywords.core.map(x=>x.keyword||x.text).join('；'),'');add('关键词完成','长尾关键词',w.keywords.longTail.map(x=>x.keyword||x.text).join('；'),'');
 return rows;
}
export function worksheetCsv(bundle,listing={}){const header=['环节','项目','自身产品/中文','常见英文表达（最多5个）','市场代表性竞品1','市场代表性竞品2','最终市场需求'];return '\uFEFF'+[header,...worksheetRows(bundle,listing)].map(row=>row.map(csvCell).join(',')).join('\r\n');}
