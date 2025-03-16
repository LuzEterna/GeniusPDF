var preload_state = require("./preload.json")


var document = `<html><body>${jsonParser(preload_state.songPage.lyricsData.body)}</body></html>`

function jsonParser(json) {
    var doc = ``;
        if(Array.isArray(json)) 
            json.forEach(e=>{doc+=jsonParser(e)}) 
        else if(typeof json == 'string') {
        doc += json;
    } else {
        
        if(json.tag == "a"){ //annotations 
            doc += `<span data-annotations-id="${json.data.id}">${jsonParser(json.children)}</span>`
            
        } else 
        if(typeof json.children == 'string') {
            doc += json.children;
        } else {  
            if(json.children != undefined) //it is json with tag 
                doc += jsonParser(json.children)
        }
        
    if(json.tag != "br" || json.tag != "a")
        doc += `</${json.tag}>`;
    }
    return doc;
}


console.log(document)