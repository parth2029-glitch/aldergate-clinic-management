import { request } from './api';

export const medicalRecordService = {
  getPatientRecords: (patientId) => request(`/api/medical-records/patient/${patientId}`),
  addRecord: (data) => request('/api/medical-records', { method: 'POST', body: data })
};
