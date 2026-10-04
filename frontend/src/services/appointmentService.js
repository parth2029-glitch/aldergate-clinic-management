import { request } from './api';

/* The API speaks `appointmentDate` / `appointmentTime` (api-contract.md). Every
   screen was built against the placeholder shape, which used `date` / `time`.
   Translating here — once — keeps all components on a single shape and stops the
   two vocabularies drifting apart again. */
export function toUiAppointment(a) {
  if (!a) return a;
  const { appointmentDate, appointmentTime, status, ...rest } = a;
  const normalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : status;
  return { ...rest, status: normalizedStatus, date: appointmentDate, time: appointmentTime };
}

export const appointmentService = {
  bookAppointment: (data) =>
    request('/api/appointments', {
      method: 'POST',
      body: {
        doctorId: data.doctorId,
        appointmentDate: data.date,
        appointmentTime: data.time,
        reason: data.reason,
      },
    }).then(toUiAppointment),
  getMyAppointments: () =>
    request('/api/appointments/my').then((list) => (list || []).map(toUiAppointment)),
  getAppointmentById: (id) => request(`/api/appointments/${id}`).then(toUiAppointment),
  updateStatus: (id, status) =>
    request(`/api/appointments/${id}/status`, { method: 'PUT', body: { status } }).then(
      toUiAppointment,
    ),
  cancelAppointment: (id) => request(`/api/appointments/${id}`, { method: 'DELETE' }),
};
