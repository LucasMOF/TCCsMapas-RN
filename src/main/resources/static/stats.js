function createElement(city){
    const statsDiv = document.getElementById("stats")
    
    const cityH3 = document.createElement('h3')
    cityH3.textContent = city
    statsDiv.appendChild(cityH3)

    const cityNumber = document.createElement("p")
    cityNumber.id = city
    statsDiv.appendChild(cityNumber)
    cityNumber.textContent = "1"
}

async function loadStats() {
    objectsAtDisplay = []
    cityNumber = []
    
    const getResult = await fetch("http://localhost:3333/all", {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    const result = await getResult.json()
    for(i = 0; i<result.length; i++){
        console.log("a")
        if(objectsAtDisplay.indexOf(result[i].Municipio) == -1){
            createElement(result[i].Municipio)
            objectsAtDisplay.push(result[i].Municipio)
            cityNumber.push(1)
        }else{
            cityNumber[objectsAtDisplay.indexOf(result[i].Municipio)]+=1
        }
    }
    objectsAtDisplay.map((value,index)=> document.getElementById(value).textContent = cityNumber[index])
    console.log(objectsAtDisplay, cityNumber)
}

