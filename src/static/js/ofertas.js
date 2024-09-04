document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById('id_cpf');
    const cpfForm = document.getElementById('cpfForm');
    const customerInfo = document.getElementById('customerInfo');
    const divBandeira = document.getElementById('divBandeira');
    const bandeiraSeletor = document.getElementById('bandeiraSeletor');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const vitrineCliente = document.getElementById('vitrineCliente');
    const ativasCliente = document.getElementById('ativasCliente');

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
        hideElements([customerInfo,divBandeira,vitrineCliente, ativasCliente])
        alert('CPF inválido');
        // Opcionalmente, você pode limpar o campo ou tomar outras ações
        cpfInput.value = '';
    } else {
        // Chama a função hideElements se o CPF for válido
        hideElements([vitrineCliente, ativasCliente])
    }
});

    // Envio CPF retorna bandeiras para o seletor, dados do cliente
    cpfForm.addEventListener('submit', function(e) {
         e.preventDefault();
         const cpf = cpfInput.value;

         fetch('consulta_cpf_cognito/', {
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
                hideElements([customerInfo, divBandeira, vitrineCliente, ativasCliente]);
            } else {
                document.getElementById('clientName').textContent = data.nome;
                document.getElementById('clientEmail').textContent = data.email;
                document.getElementById('clientPhone').textContent = data.fone;

                populateBandeiraSeletor(data.bandeiras);
                showElements([customerInfo, divBandeira]);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert("Erro ao buscar informações do cliente");
        });
    });

    // Seleção de bandeira
    bandeiraSeletor.addEventListener('change', function() {
        const bandeiraSelecionada = this.value;
        if (bandeiraSelecionada === '') {
            hideElements([vitrineCliente, ativasCliente]);
            return;
        } else {
            hideElements([vitrineCliente, ativasCliente]);
            loadingIndicator.style.display = 'block';

            fetch('consulta_vitrine/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ bandeira: bandeiraSelecionada })
            })
                .then(response => response.json())
                .then(data => {
                    populateVitrineTable(data.vitrine_cliente);
                    populateOfertasAtivasTable(data.ofertas_ativas);
                    showElements([vitrineCliente, ativasCliente]);
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert("Erro ao consultar ofertas.");
                })
                .finally(() => {
                    loadingIndicator.style.display = 'none';
                });
        }
    });
    

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

    function populateBandeiraSeletor(bandeiras) {
        bandeiraSeletor.innerHTML = '<option value="">Selecione uma bandeira</option>';
        bandeiras.forEach(bandeira => {
            const option = document.createElement('option');
            option.value = bandeira;
            option.textContent = bandeira;
            bandeiraSeletor.appendChild(option);
        });
    }

    function populateVitrineTable(vitrine_cliente) {
        const ofertasContainer = document.getElementById('ofertasContainer');
    ofertasContainer.innerHTML = ''; // Limpa o conteúdo anterior

    let vitrine = '<table id="vitrineTable" class="table table-bordered">';
    vitrine += "<thead><tr>" +
        "<th>Codigo Oferta</th>" +
        "<th>EAN</th>" +
        "<th>Produto</th>" +
        "<th>Categoria</th>" +
        "<th>Tipo Oferta</th>" +
        "<th>Preço De</th>" +
        "<th>Preço Por</th>" +
        "<th>Desconto</th>" +
        "<th>Unidade</th>" +
        "<th>Disponível</th>" +
        "<th>Maximo</th>" +
        "<th>Data Início</th>" +
        "<th>Data Fim</th>" +
        "<th>Imagem</th>" +
        "</tr></thead>";
    vitrine += "<tbody>";

    vitrine_cliente.forEach(function (item) {
        vitrine += "<tr>" +
            "<td>" + item.codigoofertapdv + "</td>" +
            "<td>" + item.ean + "</td>" +
            "<td>" + item.produto + "</td>" +
            "<td>" + item.categoria + "</td>" +
            "<td>" + item.tipooferta + "</td>" +
            "<td>" + item.precode + "</td>" +
            "<td>" + item.precopor + "</td>" +
            "<td>" + item.percentualdesc + "%</td>" +
            "<td>" + item.unidade + "</td>" +
            "<td>" + item.disponivel + "</td>" +
            "<td>" + item.maximo + "</td>" +
            "<td>" + item.inicio + "</td>" +
            "<td>" + item.fim + "</td>" +
            '<td><img src="' + item.imagem + '" alt="Imagem do Produto" style="width:50px;height:auto;"></td>' +
            "</tr>";
    });

    vitrine += "</tbody></table>";
    ofertasContainer.innerHTML = vitrine;
    $("#vitrineTable").DataTable(); // Inicializa o DataTable
    }

    function populateOfertasAtivasTable(ofertas_ativas) {
        const ativasContainer = document.getElementById('ativasContainer');
        ativasContainer.innerHTML = ''; // Limpa o conteúdo anterior
    
        let ofertas = '<table id="ofertasTable" class="table table-bordered">';
        ofertas += "<thead><tr>" +
            "<th>Codigo Oferta</th>" +
            "<th>Modalidade</th>" +
            "<th>Preco Por</th>" +
            "<th>% de Desconto</th>" +
            "<th>Medida</th>" +
            "<th>Maximo</th>" +
            "<th>Disponivel</th>" +
            "<th>Inicio</th>" +
            "<th>Fim</th>" +
            "<th>PLU : PRODUTO</th>" +
            "</tr></thead>";
        ofertas += "<tbody>";
    
        ofertas_ativas.forEach(function (item) {
            let itensAceitos = "";
            item.itensaceitos.forEach(function (aceito) {
                itensAceitos += "<div>" + aceito.codigo + ": " + aceito.descricao + "</div>";
            });
    
            ofertas += "<tr>" +
                "<td>" + item.codigoofertapdv + "</td>" +
                "<td>" + item.modalidade + "</td>" +
                "<td>" + item.precocomdesc + "</td>" +
                "<td>" + item.percdesc + "</td>" +
                "<td>" + item.unmed + "</td>" +
                "<td>" + item.quantmax + "</td>" +
                "<td>" + item.quantdisp + "</td>" +
                "<td>" + item.datainicio + "</td>" +
                "<td>" + item.datafinal + "</td>" +
                "<td>" + itensAceitos + "</td>" +
                "</tr>";
        });
    
        ofertas += "</tbody></table>";
        ativasContainer.innerHTML = ofertas;
        $("#ofertasTable").DataTable(); // Inicializa o DataTable
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
