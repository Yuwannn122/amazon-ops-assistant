// Read standard .xlsx files locally; never evaluate formulas or follow external links.
export async function readXlsxTables(buffer,{parseXml=text=>new DOMParser().parseFromString(text,'application/xml')}={}){
 const bytes=new Uint8Array(buffer),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),decode=new TextDecoder();
 if(bytes.length<22)throw Error('Excel 文件不完整');let end=-1;
 for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(view.getUint32(p,true)===0x06054b50){end=p;break}
 if(end<0)throw Error('请选择标准 XLSX 文件；旧 XLS 请先另存为 XLSX 或 CSV');
 const count=view.getUint16(end+10,true);if(count>1000)throw Error('Excel 文件内容过多，请缩小导出范围');let cursor=view.getUint32(end+16,true),total=0;const files=new Map();
 for(let i=0;i<count;i++){
  if(cursor+46>bytes.length||view.getUint32(cursor,true)!==0x02014b50)throw Error('Excel 压缩目录损坏');
  const flags=view.getUint16(cursor+8,true),method=view.getUint16(cursor+10,true),compressed=view.getUint32(cursor+20,true),plain=view.getUint32(cursor+24,true),nameLength=view.getUint16(cursor+28,true),extraLength=view.getUint16(cursor+30,true),commentLength=view.getUint16(cursor+32,true),offset=view.getUint32(cursor+42,true);
  const name=decode.decode(bytes.subarray(cursor+46,cursor+46+nameLength));cursor+=46+nameLength+extraLength+commentLength;
  if(!/^xl\/[A-Za-z0-9_./-]+\.xml(?:\.rels)?$/.test(name)||name.includes('..'))continue;
  if(flags&1)throw Error('暂不支持加密 Excel，请从 SIF 重新导出');if(plain>8*1024*1024||(total+=plain)>20*1024*1024)throw Error('Excel 解压内容过大，请缩小导出范围');
  if(offset+30>bytes.length||view.getUint32(offset,true)!==0x04034b50)throw Error('Excel 文件内容损坏');const start=offset+30+view.getUint16(offset+26,true)+view.getUint16(offset+28,true);if(start+compressed>bytes.length)throw Error('Excel 文件内容不完整');const packed=bytes.subarray(start,start+compressed);let result;
  if(method===0)result=packed;else if(method===8){const reader=new Blob([packed]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();const chunks=[];let length=0;for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>8*1024*1024||length>plain){await reader.cancel();throw Error('Excel 解压长度异常')}chunks.push(value)}result=new Uint8Array(length);let at=0;for(const chunk of chunks){result.set(chunk,at);at+=chunk.length}}else throw Error('不支持此 Excel 压缩方式，请另存为标准 XLSX');
  if(result.length!==plain)throw Error('Excel 数据长度不一致');files.set(name,decode.decode(result));
 }
 const xml=name=>{if(!files.has(name))return null;const doc=parseXml(files.get(name));if(doc.getElementsByTagName('parsererror').length)throw Error('Excel XML 内容损坏');return doc};
 const nodes=(root,name)=>root?Array.from(root.getElementsByTagName(name)):[];
 const strings=nodes(xml('xl/sharedStrings.xml'),'si').map(si=>nodes(si,'t').map(n=>n.textContent).join(''));
 const styles=xml('xl/styles.xml'),customFormats=new Map(nodes(styles,'numFmt').map(n=>[n.getAttribute('numFmtId'),n.getAttribute('formatCode')]));
 const cellFormats=nodes(styles?.getElementsByTagName('cellXfs')[0],'xf').map(n=>{const id=n.getAttribute('numFmtId');return id==='9'||id==='10'||customFormats.get(id)?.includes('%')});
 const relationships=new Map(nodes(xml('xl/_rels/workbook.xml.rels'),'Relationship').filter(n=>n.getAttribute('TargetMode')!=='External').map(n=>[n.getAttribute('Id'),n.getAttribute('Target')]));
 const sheets=nodes(xml('xl/workbook.xml'),'sheet');if(!sheets.length)throw Error('Excel 中没有工作表');const tables=[];
 for(const sheet of sheets.slice(0,20)){
  const target=relationships.get(sheet.getAttribute('r:id'));if(!target)continue;const path=new URL(target,'https://xlsx.local/xl/workbook.xml').pathname.slice(1);if(!path.startsWith('xl/worksheets/')||!files.has(path))continue;
  const rows=[];for(const row of nodes(xml(path),'row').slice(0,3001)){const out=[];for(const cell of nodes(row,'c')){const letters=cell.getAttribute('r')?.match(/^[A-Z]+/)?.[0];if(!letters)continue;let column=0;for(const letter of letters)column=column*26+letter.charCodeAt(0)-64;if(column>150)continue;const type=cell.getAttribute('t'),value=nodes(cell,'v')[0]?.textContent||'';let text=type==='s'?strings[Number(value)]||'':type==='inlineStr'?nodes(cell,'t').map(n=>n.textContent).join(''):value;if(type!=='s'&&type!=='inlineStr'&&cellFormats[Number(cell.getAttribute('s'))]&&value!==''&&!Number.isNaN(Number(value)))text=String(Number((Number(value)*100).toFixed(6)))+'%';out[column-1]=text}if(out.some(v=>v!==''))rows.push(out)}tables.push({name:sheet.getAttribute('name')||'工作表',rows});
 }
 if(!tables.length)throw Error('没有可读取的标准工作表，请另存为 CSV');return tables;
}
