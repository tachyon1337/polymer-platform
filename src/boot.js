//platform bootstrapper facade
if(typeof global==='undefined'){
    global=window;
}
global.Platform = global.Platform || {};
global.logFlags = global.logFlags || {};
