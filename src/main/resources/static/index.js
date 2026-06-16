function onload() {
    const paths = document.getElementsByTagName("path")
    for (i = 0; i < paths.length; i++) {
        paths[i].addEventListener("click", (element) => load(element.target.id), false)
    }
}

function cleanText(text) {
    text = text.replaceAll(" ","")
    text = text.replaceAll("-","")
    text = text.replaceAll(":","")
    text = text.replaceAll("/", "")
    text = text.toUpperCase()
    return text
}

//recieves the result from fetch
//TODO: do all better
function createObject(info, id) {
    const aside = document.getElementById("aside")
    if (!info) return console.log("No given info")

    const div = document.createElement("div")
    div.id = id
    div.className = "item"
    aside.appendChild(div)

    const headerDiv = document.createElement("div")
    headerDiv.className = "header"
    headerDiv.style = "-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;-o-user-select:none;"
    headerDiv.addEventListener("click", (element) => toggleDetails(element.target.parentElement), false)
    div.appendChild(headerDiv)

    const hiddenDiv = document.createElement("div")
    hiddenDiv.style.display = 'none'
    hiddenDiv.className = "hiddenDiv"
    hiddenDiv.id = id + "hidden"



    if (info.Titulo) {
        /*const tituloHeader = document.createElement("h1")
        const tituloHeaderNode = document.createTextNode("Titulo:")
        tituloHeader.appendChild(tituloHeaderNode)
        headerDiv.appendChild(tituloHeader)*/
        const titulo = document.createElement("h3")
        const tituloNode = document.createTextNode(info.Titulo)
        titulo.appendChild(tituloNode)
        headerDiv.appendChild(titulo)
    }
    if (info.Discente) {
        const discenteHeader = document.createElement("h1")
        const discenteHeaderNode = document.createTextNode("Discente:")
        discenteHeader.appendChild(discenteHeaderNode)
        hiddenDiv.appendChild(discenteHeader)

        const discente = document.createElement("h3")
        const discenteNode = document.createTextNode(info.Discente)
        discente.appendChild(discenteNode)
        hiddenDiv.appendChild(discente)
        div.appendChild(hiddenDiv)

    }
    if (info.Matricula) {
        const matriculaHeader = document.createElement("h1")
        const matriculaHeaderNode = document.createTextNode("Matricula:")
        matriculaHeader.appendChild(matriculaHeaderNode)
        hiddenDiv.appendChild(matriculaHeader)
        div.appendChild(matriculaHeader)
        const matricula = document.createElement("h3")
        const matriculaNode = document.createTextNode(info.Matricula)
        matricula.appendChild(matriculaNode)
        hiddenDiv.appendChild(matricula)
    }
    if (info.Email) {
        const emailHeader = document.createElement("h1")
        const emailHeaderNode = document.createTextNode("Email:")
        emailHeader.appendChild(emailHeaderNode)
        hiddenDiv.appendChild(emailHeader)
        const email = document.createElement("h3")
        const emailNode = document.createTextNode(info.Email)
        email.appendChild(emailNode)
        hiddenDiv.appendChild(email)
    }
    if (info.Telefone) {
        const telefoneHeader = document.createElement("h1")
        const telefoneHeaderNode = document.createTextNode("Telefone:")
        telefoneHeader.appendChild(telefoneHeaderNode)
        hiddenDiv.appendChild(telefone)
        const telefone = document.createElement("h3")
        const telefoneNode = document.createTextNode(info.Telefone)
        telefone.appendChild(telefoneNode)
        hiddenDiv.appendChild(telefone)
    }
    if (info.Orientador) {
        const orientadorHeader = document.createElement("h1")
        const orientadorHeaderNode = document.createTextNode("Orientador(a):")
        orientadorHeader.appendChild(orientadorHeaderNode)
        hiddenDiv.appendChild(orientadorHeader)
        const orientador = document.createElement("h3")
        const orientadorNode = document.createTextNode(info.Orientador)
        orientador.appendChild(orientadorNode)
        hiddenDiv.appendChild(orientador)
    }

    if (info.Examinador1) {
        const examinador1Header = document.createElement("h1")
        const examinador1HeaderNode = document.createTextNode("Examinador1:")
        examinador1Header.appendChild(examinador1HeaderNode)
        hiddenDiv.appendChild(examinador1Header)
        const examinador1 = document.createElement("h3")
        const examinador1Node = document.createTextNode(info.Examinador1)
        examinador1.appendChild(examinador1Node)
        hiddenDiv.appendChild(examinador1)
    }
    if (info.Examinador2) {
        const examinador2Header = document.createElement("h1")
        const examinador2HeaderNode = document.createTextNode("Examinador2:")
        examinador2Header.appendChild(examinador2HeaderNode)
        hiddenDiv.appendChild(examinador2Header)
        const examinador2 = document.createElement("h3")
        const examinador2Node = document.createTextNode(info.Examinador2)
        examinador2.appendChild(examinador2Node)
        hiddenDiv.appendChild(examinador2)
    }
    if (info.Municipio) {
        const municipioHeader = document.createElement("h1")
        const municipioHeaderNode = document.createTextNode("Municipio:")
        municipioHeader.appendChild(municipioHeaderNode)
        hiddenDiv.appendChild(municipioHeader)
        const municipio = document.createElement("h3")
        const municipioNode = document.createTextNode(info.Municipio)
        municipio.appendChild(municipioNode)
        hiddenDiv.appendChild(municipio)
    }
    const btn = document.createElement("button")
    btn.id = cleanText(info.Titulo)
    btn.className = "downloadBtn"
    btn.textContent = "Download"
    btn.onclick = ()=>startDownload(btn.id) 
    hiddenDiv.appendChild(btn)
}

async function startDownload(TCCName){
    console.log(TCCName)
    const getResult = await fetch(`http://localhost:3333/Download?TCC=${TCCName}`, {
        headers:{
            'Content-Type': 'application/json',
            Accept: 'application/pdf',}
        }
    ).then(response=> response.blob())
    .then(blob =>{
        if(blob.type != "application/pdf") return
        var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = `${TCCName}.pdf`;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();    
            a.remove();
    })
    
    console.log(getResult)
}

var objectsAtDisplay = []
//TODO: clean this
async function load(id) {
    const city = document.getElementById("city")
    const resultNumber = document.getElementById("resultNumber")
    city.textContent = id

    objectsAtDisplay.forEach((element) => {
        const object = document.getElementById(element)
        object.remove()
    })
    objectsAtDisplay = []
    const newRequestBody = JSON.stringify({
        "city": id.toUpperCase() + "/RN"
    })
    const getResult = await fetch("http://localhost:8080/api/tccs/busca?municipio=" + id.toUpperCase() + "/RN", {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    const result = await getResult.json()
    resultNumber.textContent = result.length
    for (i = 0; i < result.length; i++) {
        createObject(result[i], i)
        objectsAtDisplay.push(i)
    }
    aside.style.display = "block"
}

function showName(id) {

    //TODO: BETTER
    const element = document.getElementById(id)
    const position = element.getBoundingClientRect()
    const popup = document.getElementById("popup")

    if (position.top < 70) {
        popup.style.top = position.top + 70 + "px"
    } else {

        popup.style.top = position.top - 70 + "px"
    }
    popup.style.display = "block"
    popup.textContent = id
    popup.style.left = position.left - 10 + "px"

}

function hideAside() {
    const aside = document.getElementById("aside")
    aside.style.display = "none"
}

function hideName() {
    const popup = document.getElementById("popup")

    popup.style.display = "none"
}

function toggleDetails(element) {
    var id = element.id
    if (!id) id = element.parentElement.id
    const hiddenDiv = document.getElementById(id + "hidden")
    if (window.getComputedStyle(hiddenDiv).display == "none") {
        return hiddenDiv.style.display = "block"
    }
    return hiddenDiv.style.display = "none"
}

function toggleMesoregion(){
    const mesoregionDiv = document.getElementById("mesoregionDiv")
    if (window.getComputedStyle(mesoregionDiv).display == "none") {
        return mesoregionDiv.style.display = "flex"
    }
    return mesoregionDiv.style.display = "none"
}
function toggleMicroregion(){
    const microregionDiv = document.getElementById("microregionDiv")
    if (window.getComputedStyle(microregionDiv).display == "none") {
        return microregionDiv.style.display = "flex"
    }
    return microregionDiv.style.display = "none"
}

function toggleSearch() {
    const searchdiv = document.getElementById("search")
    if (window.getComputedStyle(searchdiv).display == "none") {
        return searchdiv.style.display = "flex"
    }
    return searchdiv.style.display = "none"
}


//TODO: CREATE GENERIC SEARCH REQUEST AT API
async function search() {
    const city = document.getElementById("city")
    city.textContent = "Pesquisa"
    const resultNumber = document.getElementById("resultNumber")

    const tituloContent = document.getElementById("titulo").value
    const discenteContent = document.getElementById("discente").value
    const orientadorContent = document.getElementById("orientador").value
    const municipioContent = document.getElementById("municipio").value
    const newRequestBody = JSON.stringify({
        "Titulo": tituloContent,
        "Discente": discenteContent,
        "Orientador": orientadorContent,
        "Municipio": municipioContent
    })
    const getResult = await fetch("http://localhost:8080/api/tccs/busca?municipio="+municipioContent, {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
    objectsAtDisplay.forEach((element) => {
        const object = document.getElementById(element)
        object.remove()
    })
    objectsAtDisplay = []

    result = await getResult.json()
    resultNumber.textContent = result.length
    for (i = 0; i < result.length; i++) {
        createObject(result[i], i)
        objectsAtDisplay.push(i)
    }
    aside.style.display = "block"
}

function clean() {
    document.getElementById("titulo").value = ""
    document.getElementById("discente").value = ""
    document.getElementById("orientador").value = ""
    document.getElementById("examinador").value = ""
    document.getElementById("municipio").value = ""
}