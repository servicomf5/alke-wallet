// Credenciales correctas (para propósitos de aprendizaje)
const usuarioValido = {
  email: 'usuario@example.com',
  password: '123456',
};

// --- Constantes Globales ---
const TRANSACTIONS_KEY = 'wallet_transactions'; // Clave para guardar transacciones
const SALDO_KEY = 'saldoCuenta'; // Clave para guardar el saldo
const CONTACTS_KEY = 'wallet_contacts'; // Clave para guardar contactos

// --- Inicialización ---
// Si no existe saldo guardado, iniciamos con 60.000
if (localStorage.getItem(SALDO_KEY) === null) {
  localStorage.setItem(SALDO_KEY, '60000');
}

// --- Funciones Auxiliares ---

/**
 * Carga las transacciones desde localStorage
 * @returns {Array} Lista de transacciones
 */
function loadTransactions() {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Guarda la lista de transacciones en localStorage
 * @param {Array} arr - Lista de transacciones
 */
function saveTransactions(arr) {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error('Error guardando transacciones', e);
  }
}

/**
 * Agrega una nueva transacción al inicio de la lista
 * @param {Object} tx - Objeto de transacción
 */
function addTransaction(tx) {
  const arr = loadTransactions();
  arr.unshift(tx); // Añadir al inicio (más recientes primero)
  if (arr.length > 100) arr.length = 100; // Limitar a 100 transacciones
  saveTransactions(arr);
}

/**
 * Formatea un número a formato moneda chilena (CLP)
 * @param {number} n - Número a formatear
 * @returns {string} Número formateado con puntos
 */
const fmt = (n) => {
  return Number(n).toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Muestra una alerta de Bootstrap en el contenedor especificado
 * @param {string} selector - Selector CSS del contenedor
 * @param {string} type - Tipo de alerta (success, danger, info, etc.)
 * @param {string} message - Mensaje a mostrar
 */
function showAlert(selector, type, message) {
  const html = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;
  $(selector).html(html);
}

/**
 * Carga los contactos desde localStorage o devuelve valores por defecto
 * @returns {Array} Lista de contactos
 */
function loadContacts() {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    return raw
      ? JSON.parse(raw)
      : [
          {
            name: 'Eduardo Perez',
            cbu: '123456789',
            alias: 'edu.perez',
            bank: 'Banco Estado',
          },
          {
            name: 'Maria Gonzalez',
            cbu: '987654321',
            alias: 'maria.gonz',
            bank: 'Banco Chile',
          },
        ];
  } catch (e) {
    return [];
  }
}

// --- Lógica Principal (Document Ready) ---
$(document).ready(function () {
  console.log('App iniciada correctamente');

  // --- Lógica para Modales (Corrección) ---
  // Vinculación directa del evento click para abrir el modal
  const btnOpenModal = $('#openContactModal');
  const contactModal = $('#exampleModal');

  if (btnOpenModal.length && contactModal.length) {
    btnOpenModal.on('click', function () {
      console.log('Botón presionado. Abriendo modal...');
      contactModal.modal('show');
    });
  } else {
    // Solo logueamos si estamos en la página que debería tener el modal
    if (window.location.pathname.includes('sendmoney.html')) {
      console.error('No se encontró el botón o el modal en el DOM.');
    }
  }

  // 1. Lógica de Inicio de Sesión
  const loginForm = $('#loginForm');
  if (loginForm.length) {
    loginForm.on('submit', function (event) {
      event.preventDefault();
      const email = $('#email').val().trim();
      const password = $('#password').val().trim();

      if (
        email === usuarioValido.email &&
        password === usuarioValido.password
      ) {
        const alertaSuccess = `
                    <div class="alert alert-success alert-dismissible fade show text-center shadow-sm" role="alert">
                        <strong>¡Éxito!</strong> Inicio de sesión exitoso.<br>Redirigiendo...
                    </div>
                `;
        $('#mensajeContainer').html(alertaSuccess);

        setTimeout(function () {
          window.location.href = 'menu.html';
        }, 1500);
      } else {
        const alertaDanger = `
                    <div class="alert alert-danger alert-dismissible fade show text-center shadow-sm" role="alert">
                        <strong>Error</strong> Credenciales incorrectas.
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                `;
        $('#mensajeContainer').html(alertaDanger);
        $('#password').val('');
      }
    });
  }

  // 2. Lógica del Botón de Ayuda (Hint)
  const hintBtn = $('#hintBtn');
  const hintBox = $('#hintBox');

  if (hintBtn.length && hintBox.length) {
    hintBtn.on('click', function (e) {
      e.stopPropagation();
      hintBox.fadeToggle(200);
    });

    $(document).on('click', function (e) {
      if (
        !hintBtn.is(e.target) &&
        hintBtn.has(e.target).length === 0 &&
        !hintBox.is(e.target) &&
        hintBox.has(e.target).length === 0
      ) {
        hintBox.fadeOut(200);
      }
    });

    // Autocompletar al hacer clic en el hint
    hintBox.on('click', function () {
      $('#email').val(usuarioValido.email);
      $('#password').val(usuarioValido.password);
      hintBox.fadeOut(200);
    });
  }

  // 3. Lógica del Menú Principal
  const saldoDisplay = $('#saldoDisplay');
  if (saldoDisplay.length) {
    const saldo = parseInt(localStorage.getItem(SALDO_KEY), 10) || 0;
    saldoDisplay.text(`$${fmt(saldo)} CLP`);
  }

  // 4. Lógica de Depósito
  const depositForm = $('#depositForm');
  if (depositForm.length) {
    const saldoActual = parseInt(localStorage.getItem(SALDO_KEY), 10) || 0;
    $('#saldoActualDeposit').text(`$${fmt(saldoActual)} CLP`);

    depositForm.on('submit', function (e) {
      e.preventDefault();
      const amountVal = parseFloat($('#depositAmount').val());

      if (isNaN(amountVal) || amountVal <= 0) {
        showAlert(
          '#alert-container',
          'danger',
          'Por favor ingrese un monto válido mayor a 0.'
        );
        return;
      }

      const nuevoSaldo = saldoActual + amountVal;
      localStorage.setItem(SALDO_KEY, nuevoSaldo.toString());

      addTransaction({
        type: 'deposit',
        amount: amountVal,
        date: new Date().toISOString(),
      });

      showAlert(
        '#alert-container',
        'success',
        `Depósito de $${fmt(amountVal)} realizado. Nuevo saldo: $${fmt(
          nuevoSaldo
        )}`
      );

      $('#depositSummary').html(`
                <div class="card shadow-sm mt-3 fade-in">
                    <div class="card-body">
                        <h5 class="card-title text-success">Depósito Exitoso</h5>
                        <p class="card-text">
                            <strong>Monto:</strong> $${fmt(amountVal)}<br>
                            <strong>Fecha:</strong> ${new Date().toLocaleString(
                              'es-CL'
                            )}
                        </p>
                    </div>
                </div>
            `);

      $('#depositAmount').val('');
      $('#saldoActualDeposit').text(`$${fmt(nuevoSaldo)} CLP`);

      setTimeout(() => (window.location.href = 'menu.html'), 2500);
    });
  }

  // 5. Lógica de Enviar Dinero
  const sendForm = $('#sendForm');
  if (sendForm.length) {
    // Mostrar saldo disponible en la página de envío
    const saldoActual = parseInt(localStorage.getItem(SALDO_KEY), 10) || 0;
    $('#saldoDisponibleSend').text(`$${fmt(saldoActual)} CLP`);

    let contacts = loadContacts();
    let selectedContactIndex = null;

    // Función interna para renderizar contactos
    function renderContactsList(list) {
      const container = $('#contactList');
      container.empty();
      list.forEach((c, i) => {
        container.append(`
                    <li class="list-group-item d-flex justify-content-between align-items-center contact-item" data-index="${i}">
                        <div>
                            <div class="font-weight-bold contact-name">${c.name}</div>
                            <div class="small text-muted contact-details">${c.bank} - ${c.alias}</div>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-primary select-contact">Seleccionar</button>
                    </li>
                `);
      });
    }

    renderContactsList(contacts);

    // Filtrar contactos
    $('#searchContact').on('input', function () {
      const term = $(this).val().toLowerCase();
      const filtered = contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.alias.toLowerCase().includes(term)
      );
      renderContactsList(filtered);
    });

    // Guardar Nuevo Contacto
    $('#saveContactBtn').on('click', function () {
      const name = $('#contactName').val().trim();
      const cbu = $('#contactCBU').val().trim();
      const alias = $('#contactAlias').val().trim();
      const bank = $('#contactBank').val().trim();

      if (!name || !cbu || !alias || !bank) {
        showAlert(
          '#contactFormValidation',
          'danger',
          'Todos los campos son obligatorios.'
        );
        return;
      }

      contacts.push({ name, cbu, alias, bank });
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));

      $('#exampleModal').modal('hide');
      $('#contactForm')[0].reset();
      renderContactsList(contacts);
      showAlert('#mensajeSend', 'success', 'Contacto agregado correctamente.');
    });

    // Seleccionar Contacto
    $(document).on('click', '.select-contact', function () {
      $('.contact-item').removeClass('selected');
      const item = $(this).closest('.contact-item');
      item.addClass('selected');
      selectedContactIndex = item.data('index');

      $('#sendMoneyBtn').fadeIn();
    });

    // Enviar Dinero
    sendForm.on('submit', function (e) {
      e.preventDefault();
      const amountVal = parseFloat($('#sendAmount').val());
      const selectedItem = $('.contact-item.selected');

      if (selectedItem.length === 0) {
        showAlert('#mensajeSend', 'danger', 'Seleccione un contacto.');
        return;
      }

      if (isNaN(amountVal) || amountVal <= 0) {
        showAlert('#mensajeSend', 'danger', 'Ingrese un monto válido.');
        return;
      }

      const saldoActual = parseInt(localStorage.getItem(SALDO_KEY), 10) || 0;
      if (amountVal > saldoActual) {
        showAlert(
          '#mensajeSend',
          'danger',
          `Saldo insuficiente. Tienes $${fmt(saldoActual)}`
        );
        return;
      }

      const nuevoSaldo = saldoActual - amountVal;
      localStorage.setItem(SALDO_KEY, nuevoSaldo.toString());

      const contactName = selectedItem.find('.contact-name').text();

      addTransaction({
        type: 'send',
        amount: amountVal,
        date: new Date().toISOString(),
        target: { name: contactName },
      });

      showAlert(
        '#mensajeSend',
        'success',
        `Envío de $${fmt(amountVal)} a ${contactName} exitoso.`
      );
      $('#sendAmount').val('');
      $('#sendMoneyBtn').hide();
      $('.contact-item').removeClass('selected');
      $('#saldoDisponibleSend').text(`$${fmt(nuevoSaldo)} CLP`); // Actualizar saldo mostrado

      setTimeout(() => (window.location.href = 'menu.html'), 2500);
    });
  }

  // 6. Lógica de Historial de Transacciones
  const transactionsList = $('#transactionsList');
  if (transactionsList.length) {
    const txs = loadTransactions();

    function renderTransactionsList(list) {
      const container = $('#transactionsList');
      container.empty();

      if (list.length === 0) {
        container.html(
          '<div class="text-center text-muted py-4">No hay movimientos registrados.</div>'
        );
        return;
      }

      list.forEach((t) => {
        const isDeposit = t.type === 'deposit';
        const icon = isDeposit ? '+' : '-';
        const colorClass = isDeposit ? 'text-success' : 'text-danger';
        const title = isDeposit
          ? 'Depósito'
          : `Envío a ${t.target ? t.target.name : 'Desconocido'}`;

        container.append(`
                    <li class="list-group-item tx-item d-flex justify-content-between align-items-center">
                        <div>
                            <div class="font-weight-bold">${title}</div>
                            <div class="small text-muted">${new Date(
                              t.date
                            ).toLocaleString('es-CL')}</div>
                        </div>
                        <div class="tx-amount ${colorClass}">
                            ${icon}$${fmt(t.amount)}
                        </div>
                    </li>
                `);
      });
    }

    renderTransactionsList(txs);

    $('#filterTransactions').on('change', function () {
      const type = $(this).val();
      const filtered = type ? txs.filter((t) => t.type === type) : txs;
      renderTransactionsList(filtered);
    });
  }
});
