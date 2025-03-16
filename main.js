const fs = require('fs')
const Api = require("./api")

!(async()=>{
    var preload_state = await Api.GetGeniusBody("link") //example data for test
    var document = fs.readFileSync('style.html', 'utf-8');

    annotions_ids = preload_state.songPage.lyricsData.referents

    document=document.replaceAll("%%-header-%%", `${preload_state.songPage.trackingData.Title} - ${preload_state.songPage.trackingData['Primary Artist']}`)
    document=document.replace("%%-root-%%", jsonParser(preload_state.songPage.lyricsData.body))
    
    //console.log(await Api.GetAnnotion(17975864))  
    console.log(document)  
})()

function jsonParser(json) {
    var doc = ``;
        if(Array.isArray(json)) 
            json.forEach(e=>{doc+=jsonParser(e)}) 
        else if(typeof json == 'string') {
        doc += json;
    } else {
        
        if(json.tag == "a"){ //annotations 
            doc += `<span data-annotations-id="${json.data.id}">${jsonParser(json.children)}</span>`
            
        } else { 
             doc += `<${json.tag}>`;
        if(typeof json.children == 'string') {
            doc += json.children;
        } else {  
            if(json.children != undefined) //it is json with tag 
                doc += jsonParser(json.children)
        }
        
    if(json.tag != "br" && json.tag != "a")
        doc += `</${json.tag}>`;
    }
}
    return doc;
}

