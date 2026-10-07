const headerKey=value=>String(value??'').trim().toLowerCase().replace(/[\s_()（）\-]/g,'');
export const SIF_FIELDS={keyword:['关键词','搜索词','keyword','searchterm','搜索关键词'],monthlyVolume:['月搜索量','月均搜索量','monthlysearchvolume','searchvolume','搜索量'],trafficShare:['流量占比','流量份额','trafficshare'],naturalRank:['自然排名','自然位','organicrank','naturalrank'],adRank:['广告排名','sp排名','sponsoredrank','adrank'],cpc:['cpc','建议竞价','关键词竞价','bid'],conversionLabel:['转化效果','转化标签','conversionlabel'],keywordType:['关键词类型','词类型','keywordtype'],asin:['asin','产品asin','商品asin']};
export function parseDelimited(text){
 text=String(text).replace(/^\uFEFF/,'');const lines=text.split(/\r?\n/).slice(0,30);const delimiter=lines.some(line=>line.includes('\t'))?'\t':lines.some(line=>line.includes(';'))&&!lines.some(line=>line.includes(','))?';':',';
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(!quoted&&c===delimiter){row.push(cell);cell=''}else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell=''}else cell+=c}
 if(quoted)throw Error('CSV 引号未闭合，请重新导出');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
export function inspectSifRows(rows){
 if(!Array.isArray(rows)||!rows.length)throw Error('表格为空');
 const index=rows.slice(0,30).findIndex(row=>row.some(cell=>SIF_FIELDS.keyword.includes(headerKey(cell))));
 const headerRow=index<0?0:index,headers=rows[headerRow].map(v=>String(v??'').trim());
 const mapping=Object.fromEntries(Object.entries(SIF_FIELDS).map(([field,names])=>[field,headers.findIndex(h=>names.includes(headerKey(h)))]));
 return {headers,mapping,rows:rows.slice(headerRow+1),headerRow};
}
function numericValue(value){const raw=String(value??'').trim();if(!raw||/^(?:[-—]|n\/?a|null)$/i.test(raw))return null;const clean=raw.replace(/,/g,'');const m=clean.match(/^(\d+(?:\.\d+)?)\s*([kKmM万])?$/);if(!m)return null;return Number(m[1])*({k:1000,m:1000000,'万':10000}[m[2]?.toLowerCase()]||1)}
export function normalizeSifRows({rows,mapping,targetAsin,sourceAsin,period,marketplace='US'}){
 if(!/^[A-Z0-9]{10}$/.test(targetAsin||'')||!/^[A-Z0-9]{10}$/.test(sourceAsin||''))throw Error('目标 ASIN 和数据来源 ASIN 必须为十位字母或数字');
 if(marketplace!=='US')throw Error('本版先支持美国站 SIF 表格');if(!String(period||'').trim())throw Error('请填写 SIF 表格的数据周期');if(!Number.isInteger(mapping.keyword)||mapping.keyword<0)throw Error('请指定关键词列');
 const result=[],seen=new Set();let skipped=0;const read=(row,key)=>mapping[key]>=0?String(row[mapping[key]]??'').trim():'';
 for(let i=0;i<rows.length;i++){
  const row=rows[i],keyword=read(row,'keyword');if(!keyword||keyword.length>200){skipped++;continue}const rowAsin=read(row,'asin').toUpperCase()||sourceAsin;if(!/^[A-Z0-9]{10}$/.test(rowAsin)){skipped++;continue}
  const id=rowAsin+'|'+keyword.toLowerCase();if(seen.has(id)){skipped++;continue}seen.add(id);
  const monthlyVolumeRaw=read(row,'monthlyVolume');result.push({keyword,sourceAsin:rowAsin,monthlyVolume:numericValue(monthlyVolumeRaw),monthlyVolumeRaw,trafficShare:read(row,'trafficShare')||null,naturalRank:read(row,'naturalRank')||null,adRank:read(row,'adRank')||null,cpc:read(row,'cpc')||null,conversionLabel:read(row,'conversionLabel')||null,keywordType:read(row,'keywordType')||null});
  if(result.length>=2000)break;
 }
 if(!result.length)throw Error('没有可用关键词，请核对表头映射');
 return {provider:'sif_user_export',targetAsin,marketplace,period:String(period).trim().slice(0,100),importedAt:new Date().toISOString(),rows:result,skipped,truncated:rows.length>2000,notes:['这是用户提供的 SIF 导出快照，不是自动直连 SIF','最多保留2000条关键词，模型一次最多使用150条','未映射或无效数值保持缺失；排名、流量占比与 CPC 保留表中原文及单位','关键词相关性需与目标商品核对；搜索量不能推导转化率或广告预算']};
}
export function sifModelEvidence(records){if(!records)return null;const rows=[...records.rows].sort((a,b)=>(b.monthlyVolume??-1)-(a.monthlyVolume??-1));return {...records,rows:rows.slice(0,150),totalRows:rows.length,selectionNote:rows.length>150?'模型使用月搜索量较高的前150条；相关性仍需筛选':'使用全部已导入关键词'}}
