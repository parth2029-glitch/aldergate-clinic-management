import { request } from './api';
import { toUiDoctor } from './doctorService';

export const adminService = {
  createDoctor: (data) => request('/api/admin/doctors', { method: 'POST', body: data }),
  getAllDoctorsAdmin: () =>
    request('/api/admin/doctors').then((list) => (list || []).map(toUiDoctor)),
};
