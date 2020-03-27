import config from 'config'
import { responseHandler } from './response-handler'
import { userToken, authorizationHeader } from '../helpers'
const handleResponse = responseHandler.handleResponse

export const appointmentService = {
  postAppointment,
  getAppointments
}

function postAppointment (doctor, office, refDoctor, date, timeslot, reason, bookingMethod) {
  const requestOptions = {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + userToken(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctor, office, refDoctor, date, timeslot, reason, bookingMethod })
  }
  return fetch(`${config.apiUrl}/patients/appointment`, requestOptions)
    .then(handleResponse)
}

function getAppointments () {
  const requestOptions = {
	method: 'GET',
	headers: authorizationHeader()
  }
  return fetch(`${config.apiUrl}/patients/appointment`, requestOptions)
    .then(handleResponse)
}
