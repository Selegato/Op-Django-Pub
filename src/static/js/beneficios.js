document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById('id_cpf');
    const cpfForm = document.getElementById('cpfForm');
    const customerInfo = document.getElementById('customerInfo');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const customerName = document.getElementById('customerName');
    const customerEmail = document.getElementById('customerEmail');
    const customerPhone = document.getElementById('customerPhone');
    const beneficiosContainer = document.getElementById('beneficiosContainer');
    const btnBaixa = document.getElementById('btnBaixa');


    // Máscara para o CPF
    cpfInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length <= 3) {
            this.value = value;
        } else if (value.length <= 6) {
            this.value = value.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        } else if (value.length <= 9) {
            this.value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        } else {
            this.value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
        }
    });

// Validação do CPF e chamada da função hideElements
    cpfInput.addEventListener('change', function() {
    const cpf = cpfInput.value;
        if (!validateCPF(cpf)) {
        hideElements([clientInfo])
        alert('CPF inválido');
        // Opcionalmente, você pode limpar o campo ou tomar outras ações
        cpfInput.value = '';
    } else {
        // Chama a função hideElements se o CPF for válido
        hideElements([])
    }
    });

    // Envio CPF retorna bandeiras para o seletor, dados do cliente
    cpfForm.addEventListener('submit', function(e) {
         e.preventDefault();
         const cpf = cpfInput.value;

         fetch('consulta_beneficios/', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ cpf: cpf })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Customer not found') {
                alert("Cliente não encontrado");
                hideElements([customerInfo]);
            } else {
                document.getElementById('customerName').textContent = data.nome;
                document.getElementById('customerEmail').textContent = data.email;
                document.getElementById('customerPhone').textContent = data.fone;
                displayBeneficios(data.beneficios);

                showElements([customerInfo, beneficiosContainer]);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert("Erro ao buscar informações do cliente");
        });
    });

    btnBaixa.addEventListener('click', function () {
    enviarBeneficiosSelecionados();
    });

    function enviarBeneficiosSelecionados() {
        const checkboxes = document.querySelectorAll('.beneficio-checkbox:checked');
        const selectedIds = Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-id'));
    
        if (selectedIds.length === 0) {
            alert('Nenhum benefício selecionado.');
            return;
        }
    
        const bandeiraSelect = document.getElementById('bandeiraSelect');
        const bandeira = bandeiraSelect.value;
    
        if (!bandeira) {
            alert('Por favor, selecione uma bandeira.');
            return;
        }
    
        const csrftoken = getCookie('csrftoken');
    
        fetch('baixar_beneficios/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ beneficios: selectedIds, bandeira: bandeira })
        })
        .then(response => response.json())
            .then(data => {
            console.log(data);
            if (data.Status === 200) {
                alert('Benefícios enviados com sucesso.');
            } else {
                alert('Erro ao enviar benefícios.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao enviar benefícios.');
        });
    }

    function displayBeneficios(beneficios) {
        const beneficiosContainer = document.getElementById('beneficiosContainer');
        beneficiosContainer.innerHTML = ''; // Limpa o conteúdo anterior
    
        // Adiciona o campo de seleção de bandeira
        const bandeiraSelect = document.createElement('select');
        bandeiraSelect.id = 'bandeiraSelect';
        bandeiraSelect.innerHTML = `
            <option value="">Selecione uma bandeira</option>
            <option value="PREZUNIC">PREZUNIC</option>
            <option value="PERINI">PERINI</option>
            <option value="BRETAS">BRETAS</option>
        `;
        beneficiosContainer.appendChild(bandeiraSelect);
    
        const table = document.createElement('table');
        table.className = 'table table-striped';
    
        const thead = document.createElement('thead');
        thead.innerHTML = `
          <tr>
            <th>Selecionar</th>
            <th>Título</th>
            <th>Nível</th>
            <th>Status</th>
            <th>Data de Ativação</th>
            <th>Data de Resgate</th>
            <th>Quantidade Disponível</th>
          </tr>
        `;
        table.appendChild(thead);
    
        const tbody = document.createElement('tbody');
        beneficios.forEach(beneficio => {
          const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${beneficio.Status !== 'resgatado' ? '<input type="checkbox" class="beneficio-checkbox" data-id="' + beneficio.IdBeneficioUser + '" />' : ''}</td>
            <td>${beneficio.Titulo}</td>
            <td>${beneficio.Nível}</td>
            <td>${beneficio.Status}</td>
            <td>${beneficio.DtAtivacao}</td>
            <td>${beneficio.DtResgate}</td>
            <td>${beneficio.QtdDisponivel}</td>
          `;
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    
        beneficiosContainer.appendChild(table);
    
        // Adiciona o botão de envio
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Enviar Benefícios Selecionados';
        submitButton.onclick = enviarBeneficiosSelecionados;
        beneficiosContainer.appendChild(submitButton);
    
        document.getElementById('divBeneficios').style.display = 'block';
    }
    

    // Funções auxiliares
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function hideElements(elements) {
        elements.forEach(el => el.style.display = 'none');
    }

    function showElements(elements) {
        elements.forEach(el => el.style.display = 'block');
    }


    function validateCPF(cpf) {
        // Remove non-numeric characters
        cpf = cpf.replace(/\D/g, '');
    
        // Check if the CPF has 11 digits
        if (cpf.length !== 11) {
            return false;
        }
    
        // Check if all digits are the same
        if (/^(\d)\1+$/.test(cpf)) {
            return false;
        }
    
        // Validate the first check digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let checkDigit1 = 11 - (sum % 11);
        if (checkDigit1 === 10 || checkDigit1 === 11) {
            checkDigit1 = 0;
        }
        if (checkDigit1 !== parseInt(cpf.charAt(9))) {
            return false;
        }
    
        // Validate the second check digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        let checkDigit2 = 11 - (sum % 11);
        if (checkDigit2 === 10 || checkDigit2 === 11) {
            checkDigit2 = 0;
        }
        if (checkDigit2 !== parseInt(cpf.charAt(10))) {
            return false;
        }
    
        return true;
    }
    
});
