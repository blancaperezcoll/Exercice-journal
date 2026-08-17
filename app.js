// Elements de la pantalla
const textComptador = document.getElementById('comptador-dies');
const botoEntrenar = document.querySelector('button:first-child');
const botoCongelar = document.querySelector('button:last-child');
const formulari = document.getElementById('formulari-exercici');
const inputData = document.getElementById('data-exercici');
const selectTipus = document.getElementById('tipus-activitat');
const campsForca = document.getElementById('camps-forca');
const campsCardio = document.getElementById('camps-cardio');
const llistaHistorial = document.getElementById('llista-historial');
const botoNetejar = document.getElementById('boto-netejar');
const datalistExercicis = document.getElementById('llista-exercicis-guardats');

// Elements del calendari
const calTitol = document.getElementById('cal-titol');
const calDiesContenidor = document.getElementById('calendari-dies');
const calDetalls = document.getElementById('cal-detalls');
const calAnterior = document.getElementById('cal-anterior');
const calSeguent = document.getElementById('cal-seguent');

let dataCalendariActual = new Date();

// Posar la data d'avui per defecte a l'input de data
if (inputData) {
    inputData.valueAsDate = new Date();
}

// Mostrar / Amagar camps del formulari segons el tipus d'activitat triat
if (selectTipus) {
    selectTipus.addEventListener('change', () => {
        if (selectTipus.value === 'cardio') {
            campsForca.style.display = 'none';
            campsCardio.style.display = 'block';
        } else {
            campsForca.style.display = 'block';
            campsCardio.style.display = 'none';
        }
    });
}

// Variables per a les dades guardades
let diesCompletats = Number(localStorage.getItem('diesCompletats')) || 0;
let historial = JSON.parse(localStorage.getItem('historialFitStreak')) || [];
let exercicisGuardats = JSON.parse(localStorage.getItem('exercicisGuardatsFitStreak')) || ["Press banca", "Sentadetes", "Dominades", "Flexions", "Córrer", "Ciclisme"];
let ultimaPuntaSetmana = Number(localStorage.getItem('ultimaPuntaSetmana')) || 0;
let elMeugrafic = null;

// Funció per carregar les opcions de la llista desplegable
function carregarOpcionsExercicis() {
    if (!datalistExercicis) return;
    datalistExercicis.innerHTML = '';
    exercicisGuardats.forEach(nom => {
        const option = document.createElement('option');
        option.value = nom;
        datalistExercicis.appendChild(option);
    });
}

// Funció per calcular l'últim dilluns a les 05:00 am
function getUltimDilluns5AM() {
    const ara = new Date();
    const d = new Date(ara);
    const diaSetmana = d.getDay();
    const diesDesDeDilluns = (diaSetmana + 6) % 7;
    d.setDate(d.getDate() - diesDesDeDilluns);
    d.setHours(5, 0, 0, 0);

    if (diaSetmana === 1 && ara.getHours() < 5) {
        d.setDate(d.getDate() - 7);
    }
    return d.getTime();
}

// Comprovar si ha passat el dilluns a les 05:00 am per reiniciar la ràtxa automàticament
function comprovarCanviSetmana() {
    const tallActual = getUltimDilluns5AM();
    if (ultimaPuntaSetmana === 0) {
        localStorage.setItem('ultimaPuntaSetmana', tallActual);
        return;
    }
    if (ultimaPuntaSetmana < tallActual) {
        const dataText = new Date().toLocaleDateString();
        const resumSetmana = {
            text: `📊 Setmana finalitzada: ${diesCompletats}/4 dies completats`,
            tipus: 'congelat',
            data: dataText
        };
        historial.push(resumSetmana);
        localStorage.setItem('historialFitStreak', JSON.stringify(historial));
        diesCompletats = 0;
        localStorage.setItem('diesCompletats', diesCompletats);
        localStorage.setItem('ultimaPuntaSetmana', tallActual);
    }
}

// Renderitzar el Calendari visual
function renderitzarCalendari() {
    if (!calDiesContenidor) return;
    calDiesContenidor.innerHTML = '';

    const any = dataCalendariActual.getFullYear();
    const mes = dataCalendariActual.getMonth();

    const nomMesos = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];
    calTitol.textContent = `${nomMesos[mes]} ${any}`;

    const primerDiaMes = new Date(any, mes, 1);
    const ultimDiaMes = new Date(any, mes + 1, 0);

    let diaIniciIndex = (primerDiaMes.getDay() + 6) % 7;

    for (let i = 0; i < diaIniciIndex; i++) {
        const divBuit = document.createElement('div');
        divBuit.classList.add('dia-cal', 'buit');
        calDiesContenidor.appendChild(divBuit);
    }

    const avui = new Date();

    for (let dia = 1; dia <= ultimDiaMes.getDate(); dia++) {
        const divDia = document.createElement('div');
        divDia.classList.add('dia-cal');
        divDia.textContent = dia;

        const dataStr = new Date(any, mes, dia).toLocaleDateString();

        if (dia === avui.getDate() && mes === avui.getMonth() && any === avui.getFullYear()) {
            divDia.classList.add('avui');
        }

        const registresDelDia = historial.filter(item => item.data === dataStr);

        let teEntrenament = registresDelDia.some(r => r.tipus === 'entrenament');
        let teCongelat = registresDelDia.some(r => r.tipus === 'congelat');

        if (teEntrenament) {
            divDia.classList.add('entrenat');
        } else if (teCongelat) {
            divDia.classList.add('congelat');
        }

        divDia.addEventListener('click', () => {
            if (registresDelDia.length > 0) {
                let detallsHTML = `<strong>Dades del ${dataStr}:</strong><br>`;
                registresDelDia.forEach(r => {
                    detallsHTML += `- ${r.text}<br>`;
                });
                calDetalls.innerHTML = detallsHTML;
            } else {
                calDetalls.innerHTML = `<strong>${dataStr}:</strong> Sense registres (Dia de descans 💤)`;
            }
        });

        calDiesContenidor.appendChild(divDia);
    }
}

// Botons per canviar de mes al calendari
if (calAnterior && calSeguent) {
    calAnterior.addEventListener('click', () => {
        dataCalendariActual.setMonth(dataCalendariActual.getMonth() - 1);
        renderitzarCalendari();
    });
    calSeguent.addEventListener('click', () => {
        dataCalendariActual.setMonth(dataCalendariActual.getMonth() + 1);
        renderitzarCalendari();
    });
}

// Dibuixar el gràfic de pes amb Chart.js
function actualitzarGrafic() {
    const canvas = document.getElementById('graficProgres');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const registresAmbPes = historial.filter(item => item.pes && item.pes > 0);

    const etiquetes = registresAmbPes.map(item => item.data);
    const dadesPes = registresAmbPes.map(item => item.pes);

    if (elMeugrafic) {
        elMeugrafic.destroy();
    }

    elMeugrafic = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetes,
            datasets: [{
                label: 'Pes aixecat (kg)',
                data: dadesPes,
                borderColor: '#f4acb7',
                backgroundColor: 'rgba(244, 172, 183, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Esborrar un registre concret (Paperera 🗑️)
function esborrarRegistre(index) {
    historial.splice(index, 1);
    localStorage.setItem('historialFitStreak', JSON.stringify(historial));
    actualitzarPantalla();
}

// Funció principal per actualitzar tota la pantalla
function actualitzarPantalla() {
    comprovarCanviSetmana();
    carregarOpcionsExercicis();

    textComptador.textContent = diesCompletats;
    llistaHistorial.innerHTML = '';

    historial.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item.text + " ";
        
        const botoEliminar = document.createElement('button');
        botoEliminar.textContent = '🗑️';
        botoEliminar.classList.add('boto-esborrar');
        
        botoEliminar.addEventListener('click', () => {
            esborrarRegistre(index);
        });

        li.appendChild(botoEliminar);

        if (item.tipus === 'entrenament') {
            li.classList.add('registre-entrenament');
        } else {
            li.classList.add('registre-congelat');
        }
        
        llistaHistorial.prepend(li);
    });

    actualitzarGrafic();
    renderitzarCalendari();
}

// Executar en carregar la pàgina
actualitzarPantalla();

// Botó per registrar dia a la ràtxa
botoEntrenar.addEventListener('click', () => {
    if (diesCompletats < 4) {
        diesCompletats++;
        localStorage.setItem('diesCompletats', diesCompletats);
        actualitzarPantalla();
        alert("Molt bé! Has sumat un dia a la ràtxa setmanal 💪");
    } else {
        alert("Ja has complert l'objectiu de 4 dies aquesta setmana! Enhorabona 🎉");
    }
});

// Botó per congelar la ràtxa
botoCongelar.addEventListener('click', () => {
    const motiu = prompt("Per quin motiu no pots entrenar avui?");
    
    if (motiu && motiu.trim() !== "") {
        const dataFormatejada = new Date().toLocaleDateString();
        const entrada = {
            text: `❄️ ${dataFormatejada} - Congelat: "${motiu}"`,
            tipus: 'congelat',
            data: dataFormatejada
        };
        
        historial.push(entrada);
        localStorage.setItem('historialFitStreak', JSON.stringify(historial));
        actualitzarPantalla();
        alert("Ràtxa congelada correctament!");
    }
});

// Formulari de registre (Força / Cardio / Temps)
formulari.addEventListener('submit', (e) => {
    e.preventDefault();

    const dataSeleccionada = inputData.value ? new Date(inputData.value).toLocaleDateString() : new Date().toLocaleDateString();
    const nom = document.getElementById('nom-exercici').value.trim();
    const tipus = selectTipus ? selectTipus.value : 'forca';
    
    // Guardar el nom de l'exercici a la llista de suggeriments
    if (nom && !exercicisGuardats.includes(nom)) {
        exercicisGuardats.push(nom);
        localStorage.setItem('exercicisGuardatsFitStreak', JSON.stringify(exercicisGuardats));
    }

    let detall = '';
    let pesValor = 0;

    if (tipus === 'forca') {
        const series = document.getElementById('series').value;
        const repeticions = document.getElementById('repeticions').value;
        pesValor = document.getElementById('pes').value;
        
        detall = `🏋️ ${dataSeleccionada} - ${nom}: ${series}s x ${repeticions}r`;
        if (pesValor) detall += ` (${pesValor}kg)`;
    } else {
        const seriesCardio = document.getElementById('series-cardio').value;
        const temps = document.getElementById('temps').value;
        const unitat = document.getElementById('unitat-temps') ? document.getElementById('unitat-temps').value : 'minuts';
        const distancia = document.getElementById('distancia').value;
        
        const textUnitat = unitat === 'segons' ? 's' : ' min';
        
        if (seriesCardio) {
            detall = `🏃 ${dataSeleccionada} - ${nom}: ${seriesCardio}s x ${temps}${textUnitat}`;
        } else {
            detall = `🏃 ${dataSeleccionada} - ${nom}: ${temps}${textUnitat}`;
        }
        
        if (distancia) detall += ` (${distancia} km)`;
    }

    const entrada = {
        text: detall,
        tipus: 'entrenament',
        pes: Number(pesValor) || 0,
        data: dataSeleccionada
    };

    historial.push(entrada);
    localStorage.setItem('historialFitStreak', JSON.stringify(historial));

    formulari.reset();
    inputData.valueAsDate = new Date();
    
    if (campsForca && campsCardio) {
        campsForca.style.display = 'block';
        campsCardio.style.display = 'none';
    }
    
    actualitzarPantalla();
});

// Botó per reiniciar totes les dades
botoNetejar.addEventListener('click', () => {
    if (confirm("Segur que vols esborrar l'historial i reiniciar la ràtxa?")) {
        localStorage.clear();
        diesCompletats = 0;
        historial = [];
        exercicisGuardats = ["Press banca", "Sentadetes", "Dominades", "Flexions", "Córrer", "Ciclisme"];
        actualitzarPantalla();
    }
});