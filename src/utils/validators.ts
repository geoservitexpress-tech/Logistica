export type FieldErrors = Record<string, string>;

function isEmpty(value: string | undefined | null): boolean {
  return !value || !String(value).trim();
}

function setIfError(errors: FieldErrors, field: string, message: string | undefined): void {
  if (message) {
    errors[field] = message;
  }
}

export function requiredField(
  value: string | undefined | null,
  message: string,
): string | undefined {
  return isEmpty(value) ? message : undefined;
}

export function emailField(value: string): string | undefined {
  if (isEmpty(value)) {
    return 'Ingresa tu correo electrónico';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return 'Ingresa un correo electrónico válido';
  }
  return undefined;
}

export function phoneField(value: string, label = 'teléfono'): string | undefined {
  if (isEmpty(value)) {
    return `Ingresa el ${label}`;
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7) {
    return `Ingresa un ${label} válido`;
  }
  return undefined;
}

export function minLengthField(
  value: string,
  min: number,
  message: string,
): string | undefined {
  if (value.length < min) {
    return message;
  }
  return undefined;
}

export function validateLogin(form: { correo: string; password: string }): FieldErrors {
  const errors: FieldErrors = {};
  setIfError(errors, 'correo', emailField(form.correo));
  setIfError(errors, 'password', requiredField(form.password, 'Ingresa tu contraseña'));
  return errors;
}

export function validateRegister(form: {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  documento: string;
  password: string;
  confirmarPass: string;
  terminos: boolean;
}): FieldErrors {
  const errors: FieldErrors = {};

  setIfError(errors, 'nombres', requiredField(form.nombres, 'Ingresa tus nombres'));
  setIfError(errors, 'apellidos', requiredField(form.apellidos, 'Ingresa tus apellidos'));
  setIfError(errors, 'documento', requiredField(form.documento, 'Ingresa tu número de documento'));
  setIfError(errors, 'correo', emailField(form.correo));
  setIfError(errors, 'telefono', phoneField(form.telefono));
  setIfError(errors, 'password', requiredField(form.password, 'Ingresa una contraseña'));
  if (!errors.password) {
    setIfError(
      errors,
      'password',
      minLengthField(form.password, 8, 'La contraseña debe tener al menos 8 caracteres'),
    );
  }
  if (!isEmpty(form.password) && form.password !== form.confirmarPass) {
    errors.confirmarPass = 'Las contraseñas deben coincidir';
  }
  if (!form.terminos) {
    errors.terminos = 'Debes aceptar los términos y condiciones';
  }

  return errors;
}

export interface NewOrderFormInput {
  companyName: string;
  idNumber: string;
  recipientName: string;
  recipientPhone: string;
  idPais: string;
  idDepartamento: string;
  idCiudad: string;
  addressName: string;
  addressNum1: string;
  addressNum2: string;
  tipoPago: 'pagado' | 'cobrar_entrega';
  valorCobrar: string;
}

export function validateNewOrder(form: NewOrderFormInput): FieldErrors {
  const errors: FieldErrors = {};

  setIfError(errors, 'companyName', requiredField(form.companyName, 'Ingresa el nombre de la empresa'));
  setIfError(errors, 'idNumber', requiredField(form.idNumber, 'Ingresa el número de documento'));
  setIfError(errors, 'recipientName', requiredField(form.recipientName, 'Ingresa el nombre del destinatario'));
  setIfError(errors, 'recipientPhone', phoneField(form.recipientPhone, 'teléfono del destinatario'));
  setIfError(errors, 'idPais', requiredField(form.idPais, 'Selecciona el país'));
  setIfError(errors, 'idDepartamento', requiredField(form.idDepartamento, 'Selecciona el departamento'));
  setIfError(errors, 'idCiudad', requiredField(form.idCiudad, 'Selecciona la ciudad'));
  setIfError(errors, 'addressName', requiredField(form.addressName, 'Ingresa el número de vía'));
  setIfError(errors, 'addressNum1', requiredField(form.addressNum1, 'Ingresa el número principal (#)'));
  setIfError(errors, 'addressNum2', requiredField(form.addressNum2, 'Ingresa el número secundario (-)'));

  if (form.tipoPago === 'cobrar_entrega') {
    setIfError(errors, 'valorCobrar', requiredField(form.valorCobrar, 'Ingresa el valor a cobrar al entregar'));
  }

  return errors;
}

export interface RequestPickupFormInput {
  companyName: string;
  phone: string;
  idPais: string;
  idDepartamento: string;
  idCiudad: string;
  addressName: string;
  num1: string;
  num2: string;
}

export function validateRequestPickup(form: RequestPickupFormInput): FieldErrors {
  const errors: FieldErrors = {};

  setIfError(errors, 'companyName', requiredField(form.companyName, 'Ingresa el nombre de la empresa'));
  setIfError(errors, 'phone', phoneField(form.phone));
  setIfError(errors, 'idPais', requiredField(form.idPais, 'Selecciona el país'));
  setIfError(errors, 'idDepartamento', requiredField(form.idDepartamento, 'Selecciona el departamento'));
  setIfError(errors, 'idCiudad', requiredField(form.idCiudad, 'Selecciona la ciudad'));
  setIfError(errors, 'addressName', requiredField(form.addressName, 'Ingresa el número de vía'));
  setIfError(errors, 'num1', requiredField(form.num1, 'Ingresa el número principal (#)'));
  setIfError(errors, 'num2', requiredField(form.num2, 'Ingresa el número secundario (-)'));

  return errors;
}
