const CHANNEL='AMAZON_OPS_DATA_V1';
window.addEventListener('message',event=>{
 if(event.source!==window||event.origin!==location.origin||event.data?.channel!==CHANNEL||event.data.direction!=='to_extension')return;
 const {id,action,payload}=event.data;if(typeof id!=='string'||id.length>100)return;
 if(action==='ping'){window.postMessage({channel:CHANNEL,direction:'to_page',id,ok:true,result:{installed:true,version:'0.3.0'}},location.origin);return}
 if(action!=='research'||!payload||!/^[A-Z0-9]{10}$/.test(payload.asin||''))return;
 chrome.runtime.sendMessage({type:'research',asin:payload.asin,marketplace:payload.marketplace||'US',forceRefresh:payload.forceRefresh===true},response=>{const error=chrome.runtime.lastError;window.postMessage({channel:CHANNEL,direction:'to_page',id,...(error?{ok:false,error:'数据助手未能响应，请重新加载插件'}:response)},location.origin)});
});
