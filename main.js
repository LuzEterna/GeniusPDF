const fs = require('fs')
const puppeteer = require("puppeteer")
const Api = require("./api")

    !(async () => {
        
        var preload_state = await Api.GetGeniusBody("https://genius.com/Sehinsah-karma-lyrics") //example data for test
        var document = await fs.readFileSync('style.html', 'utf-8');

        document = document.replace("%%-root-%%", jsonParser(preload_state.songPage.lyricsData.body))

        var annotations_document = '<hr class="divider">';
        var annotation_ids = await preload_state.songPage.lyricsData.referents;

        
        if(annotation_ids.length > 0) {
            console.log(`MAIN: there are ${annotation_ids.length} annotation`)

        var annotation = (quote, description, id) => `<div id="annotation-${id}" class="quote-container">
                <blockquote>
                    <a style="all: unset; text-decoration: none" href="#annotation-lyric-${id}">${quote}</a>
                </blockquote>
                    <p>
                        ${description}
                    </p>
                </div>
                
            <hr class="divider">
            `            
            for (const id of annotation_ids) {
                var anno = await Api.GetAnnotion(id);  // Annotations API'den veri çekiyoruz
                var quote = anno.referent.fragment || anno.referent.range.content;
                var description = await jsonParser(anno.annotation.body.dom);  // JSON verisini çözüyoruz
        
                annotations_document += annotation(quote, description, id);
            }
        }

        document = document.replace("%%-annotations-%%", annotations_document)
     
        //var argumants = (key) => preload_state.songPage.trackingData.find(val => val.key == key)
        var songid = preload_state.songPage.song
        var song = preload_state.entities.songs[songid]

        document = document.replaceAll("%%-song-name-%%", song.titleWithFeatured)
        document = document.replaceAll("%%-artists-%%", song.primaryArtist.name)
        document = document.replaceAll("%%-image-%%", song.songArtImageUrl)

        console.log(document)
        console.log("MAIN: loading...")
        await createPDF(document, `${song.primaryArtist.name} - ${song.title}`)
        console.log("MAIN: pdf created.")
        
        fs.writeFile(`./${song.primaryArtist.name} - ${song.title}.html`, document, (err) => {
            if (err) {
                console.error('Dosya oluşturulurken hata oluştu:', err);
            } else {
                console.log(`MAIN: html source writed.`);
            }
        });
        
    })()

    //createPDF(fs.readFileSync('source.html', 'utf-8'), "pdfname")


    async function createPDF(htmlContent, path) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(htmlContent);
        await page.pdf({ path: path+".pdf", format: 'A4', printBackground: true, });

        await browser.close();
        return 
    }

function jsonParser(json) {
    var doc = ``;
    if (Array.isArray(json))
        json.forEach(e => {
            doc += jsonParser(e)
        })
    else if (typeof json == 'string') {
        doc += json;
    } else {
        if (json.tag == "inread-ad")
            doc += '<br>'
        else if (json.tag == "a") { //annotations 
          
            var attributes = ''
            if(json.attributes) {
                if(json?.data?.id) {
                    delete json.attributes?.href
                }

                for (const [key, value] of Object.entries(json.attributes)) {
                    attributes += `${key}="${value}" `;
                  }
                
                  attributes = attributes.trim();
            }

            doc += `<a ${attributes} href="#annotation-${json?.data?.id}" id="annotation-lyric-${json?.data?.id}" data-annotation-id="${json?.data?.id}">${jsonParser(json.children)}</a>`
        } else {
           
            var attributes = ''
            if(json.attributes) {
                for (const [key, value] of Object.entries(json.attributes)) {
                    attributes += `${key}="${value}" `;
                  }
                
                  attributes = attributes.trim();
            }

            doc += `<${json.tag} ${attributes}>`;
            if (typeof json.children == 'string') {
                doc += json.children;
            } else {
                if (json.children != undefined) //it is json with tag 
                    doc += jsonParser(json.children)
            }

            if (json.tag != "br" && json.tag != "a" && json.tag != "inread-ad")
                doc += `</${json.tag}>`;
        }
    }
    return doc;
}


