document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Faz a requisição para o seu Backend
        const response = await fetch('http://localhost:8080/api/tccs/estatisticas');
        
        if (!response.ok) {
            throw new Error("Erro ao buscar estatísticas");
        }
        
        const data = await response.json();
        
        // 1. Atualiza o número total de TCCs (ignorando os IDs que pularam)
        document.getElementById('totalTccs').textContent = data.totalTccs;

        // 2. Localiza o corpo da tabela e limpa
        const tbody = document.getElementById('tabela-professores');
        tbody.innerHTML = ''; 

        // 3. Itera sobre a lista de professores e cria as linhas dinamicamente
        data.professores.forEach(prof => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td class="nome-prof">${prof.nome}</td>
                <td><span class="badge">${prof.orientacoes}</span></td>
                <td><span class="badge">${prof.bancas}</span></td>
                <td><span class="badge badge-total">${prof.total}</span></td>
            `;
            
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro na busca de estatísticas:", error);
        document.getElementById('totalTccs').textContent = "Erro ao carregar dados.";
        
        // Opcional: Mostrar erro na tabela para o usuário
        const tbody = document.getElementById('tabela-professores');
        tbody.innerHTML = `<tr><td colspan="4" style="color: red; text-align: center;">Não foi possível carregar as estatísticas no momento.</td></tr>`;
    }
});