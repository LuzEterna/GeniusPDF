async function GetAnnotion(id) {
    var req = await fetch(`https://genius.com/api/annotations/${id}`)
    var json = await req.json()
    return json.response.annotation
}

async function GetGeniusBody() { //html crawler
    return require("./preload.json")
}

exports = module.exports = {
    GetAnnotion,
    GetGeniusBody
}