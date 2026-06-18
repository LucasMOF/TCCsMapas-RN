async function loadStats() {
    try {
        const response = await fetch("http://localhost:8080/api/tccs/estatisticas");
        if (!response.ok) throw new Error('Erro ao carregar estatísticas');

        const data = await response.json(); // Aqui pegamos o objeto com totalTccs e porProfessor
        const statsDiv = document.getElementById("stats");
        statsDiv.innerHTML = `<h1>Total de TCCs: ${data.totalTccs}</h1>`; // Mostra o total

        // Agora iteramos apenas na lista 'porProfessor'
        data.porProfessor.forEach(item => {
            const nomeProfessor = item[0] || "Não informado";
            const quantidade = item[1];

            const div = document.createElement("div");
            div.className = "stat-item";
            div.innerHTML = `
                <h3>${nomeProfessor}</h3>
                <p>Total de TCCs: ${quantidade}</p>
            `;
            statsDiv.appendChild(div);
        });
    } catch (error) {
        console.error("Erro na busca de estatísticas:", error);
    }
}