import { request } from './api';
import { consultingDays } from '../lib/format';

/* The doctor response carries an `availability` template (weekly recurring
   ranges), not a flat slot list. The screens want the day names a doctor
   consults on, so derive them here rather than in every component. */
export function toUiDoctor(d) {
  if (!d) return d;
  return { ...d, days: consultingDays(d.availability) };
}

export const doctorService = {
  getAllDoctors: (specialization) => {
    const query = specialization ? `?specialization=${encodeURIComponent(specialization)}` : '';
    return request(`/api/doctors${query}`).then((list) => (list || []).map(toUiDoctor));
  },
  getDoctorById: (id) => request(`/api/doctors/${id}`).then(toUiDoctor),
  getDoctorSlots: (id, date) => request(`/api/doctors/${id}/slots?date=${encodeURIComponent(date)}`),
  updateDoctor: (data) => request('/api/doctors/me', { method: 'PUT', body: data }).then(toUiDoctor),
  getDoctorPatients: () => request('/api/doctors/patients'),
};
