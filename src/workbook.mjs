export function worksheetText(value,depth=0){
 if(value==null||depth>10)return '';if(typeof value!=='object')return String(value).trim();
 if(Array.isArray(value))return value.map(v=>worksheetText(v,depth+1)).filter(Boolean).join('；');
 const preferred=['chinese','zh','cn','text','value','description','need','keyword','content','name'];
 for(const key of preferred)if(value[key]!=null){const result=worksheetText(value[key],depth+1);if(result)return result}
 return Object.entries(value).map(([k,v])=>{const t=worksheetText(v,depth+1);return t?`${k}：${t}`:''}).filter(Boolean).join('；');
}
const cell=v=>worksheetText(v)||'待补充';
function sequence(v){if(v==null)return [];if(Array.isArray(v))return v;if(typeof v==='object'){if(['chinese','text','value','keyword','need'].some(k=>k in v))return [v];return Object.values(v)}return [v]}
const terms=v=>sequence(v).slice(0,5).map(v=>worksheetText(v)).filter(Boolean);
const featureKeys=[['function','功能'],['material','材质'],['color','颜色'],['pattern','图案'],['combination','组合方式'],['size','尺寸/大小'],['pack_quantity','打包数量'],['use_scenarios','使用场景'],['target_audience','定位人群'],['other','其他特征']];
const english=v=>terms(v?.english||v?.en||v?.terms);
function needs(v,prefix){const rows=sequence(v);return Array.from({length:10},(_,i)=>({item:prefix+(i+1),chinese:cell(rows[i]),english:english(rows[i]),evidence:worksheetText(rows[i]?.evidence||rows[i]?.source)}))}
function feature(product,key){const a=product?.attributes||{};const values={function:product?.features,material:product?.material||a.material,color:a.color,pattern:a.pattern,combination:a.included_components,size:a.product_dimensions||a.size||(product?.capacityOz?product.capacityOz+' oz':''),pack_quantity:a.number_of_items||a.item_package_quantity,use_scenarios:a.occasion||a.recommended_uses_for_product,target_audience:a.age_range_description,other:undefined};return values[key]}
function indexed(v,i,label){if(v==null)return undefined;if(Array.isArray(v))return v[i];if(typeof v!=='object')return i===0?v:undefined;return v[label]??v['core_need_'+(i+1)]??v[String(i+1)]}

export function normalizeWorksheet(bundle,listing={}){
 const target=bundle?.target||{},w=listing?.worksheet||{},product=w.product||{},c=w.comparison||{};
 const available=Array.isArray(bundle?.competitors)?bundle.competitors:[];
 const competitors=Array.isArray(w.referenceAsins)?w.referenceAsins.map(asin=>available.find(p=>p.asin===asin)).filter(Boolean).slice(0,2):available.slice(0,2);
 const modelCompetitors=[c.competitor1,c.competitor2].map((v,i)=>{const candidate=v||sequence(c.competitors)[i]||{};return candidate.asin&&candidate.asin!==competitors[i]?.asin?{}:candidate});
 const core=needs(w.coreNeeds||w.core_needs,'核心需求');
 const comparisonRows=core.map((n,i)=>{const row=sequence(c.rows)[i]||{};return {item:n.item,target:cell(row.target||row.own||n.chinese),competitor1:cell(row.competitor1||indexed(modelCompetitors[0]?.coreNeeds||modelCompetitors[0]?.core_needs||modelCompetitors[0]?.needs||modelCompetitors[0],i,n.item)),competitor2:cell(row.competitor2||indexed(modelCompetitors[1]?.coreNeeds||modelCompetitors[1]?.core_needs||modelCompetitors[1]?.needs||modelCompetitors[1],i,n.item)),final:cell(row.final||row.finalNeed||indexed(c.finalNeeds||c.final_needs||w.finalNeeds,i,n.item)),evidence:worksheetText(row.evidence)}});
 const features=Object.fromEntries(featureKeys.map(([key,label])=>{const value=w.features?.[key];return [key,{label,chinese:cell(value??feature(target,key)),english:english(value)}]}));
 const kw=w.keywords||{};const words=v=>sequence(v).map(x=>({keyword:cell(x)}));
 return {product:{asin:target.asin||bundle?.asin,name:cell(product.name||product.chinese||target.title),english:english(product),components:cell(product.components),componentsEnglish:english(product.components),image:worksheetText(target.images?.[0]),summary:cell(w.productSummary||w.product_summary||product.summary)},features,needs:needs(w.needs,'需求'),coreNeeds:core,comparison:{rows:comparisonRows,targetAsin:target.asin,competitor1:competitors[0]?.asin,competitor2:competitors[1]?.asin,products:competitors,models:modelCompetitors},keywords:{manual:words(kw.manual||kw.manualMining),tool:words(kw.tool||kw.toolMining),core:words(kw.core||kw.coreKeywords),longTail:words(kw.longTail||kw.long_tail)}};
}
export function worksheetRows(bundle,listing={}){
 const w=normalizeWorksheet(bundle,listing),rows=[];
 const add=(s,k,cn,en='',c1='',c2='',final='')=>rows.push([s,k,cell(cn),worksheetText(en),worksheetText(c1),worksheetText(c2),worksheetText(final)]);
 const [p1={},p2={}]=w.comparison.products,[m1={},m2={}]=w.comparison.models;
 add('产品基础','产品是什么',w.product.name,'',cell(m1.product?.name||p1.title),cell(m2.product?.name||p2.title));
 add('产品基础','产品组成',w.product.components,w.product.componentsEnglish,cell(m1.product?.components||p1.attributes?.included_components),cell(m2.product?.components||p2.attributes?.included_components));
 for(const [key,label] of featureKeys)add('产品特征',label,w.features[key].chinese,w.features[key].english,cell(m1.features?.[key]??m1[key]??feature(p1,key)),cell(m2.features?.[key]??m2[key]??feature(p2,key)));
 for(const n of w.needs)add('用户需求',n.item,n.chinese,n.english);
 for(const n of w.coreNeeds)add('核心需求排序',n.item,n.chinese,n.english);
 add('产品总结','这是一款什么产品',w.product.summary);
 add('市场需求验证','ASIN',w.product.asin,'',cell(p1.asin),cell(p2.asin),'最终市场需求');
 add('市场需求验证','产品是什么',w.product.name,'',cell(p1.title),cell(p2.title));
 add('市场需求验证','图片链接',w.product.image,'',cell(p1.images?.[0]),cell(p2.images?.[0]));
 for(const r of w.comparison.rows)add('市场需求验证',r.item,r.target,'',r.competitor1,r.competitor2,r.final+(r.evidence?'（依据：'+r.evidence+'）':''));
 for(const [key,label] of [['manual','人工挖掘'],['tool','工具挖掘'],['core','核心关键词'],['longTail','长尾关键词']])add('关键词完成',label,w.keywords[key].map(x=>x.keyword));
 return rows;
}
function csvCell(v){let t=worksheetText(v);if(/^[=+@\-\t\r]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"'}
export function worksheetCsv(bundle,listing={}){return '\uFEFF'+[['环节','项目','自身产品/中文','常见英文表达（最多5个）','市场代表性竞品1','市场代表性竞品2','最终市场需求'],...worksheetRows(bundle,listing)].map(r=>r.filter((_,i)=>i!==3).map(csvCell).join(',')).join('\r\n')}
export function normalizeListingForDisplay(ai={}){const out={...ai};for(const key of ['title','summary','description','item_highlights'])out[key]=worksheetText(ai[key]);for(const key of ['bullets','search_terms','risks'])out[key]=sequence(ai[key]).map(v=>worksheetText(v));out.changes=sequence(ai.changes).filter(x=>x&&typeof x==='object').map(x=>({field:worksheetText(x.field),before:worksheetText(x.before),after:worksheetText(x.after),evidence:worksheetText(x.evidence)}));return out}
