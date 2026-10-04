import { request } from './api';

export const patientService = {
  getPatientByUserId: () => request('/api/patients/my'),
  getPatientById: (id) => request(`/api/patients/${id}`),
  updatePatient: (data) => request('/api/patients/me', { method: 'PUT', body: data })
};
