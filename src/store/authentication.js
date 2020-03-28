import { userService } from '../services'
import { router } from '../router'

const localUser = JSON.parse(localStorage.getItem('localUser'))
const initialState = localUser
  ? { status: { loggedIn: true }, localUser: localUser }
  : { status: {}, localUser: null }

// Validate the Registration Form
const validateRegistration = (email, passwordOne, passwordTwo, firstName, middleInit, lastName, street, city, state, zipcode, phone, dob, gender, marital, race) => {
  let errors = []
  const re = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (!re.test(email)) {
    errors.push(new Error('Valid email required.'))
  }
  if (!passwordOne) {
    errors.push(new Error('Password required.'))
  }
  if (!passwordTwo) {
    errors.push(new Error('Must confirm password.'))
  }
  if (passwordOne !== passwordTwo) {
    errors.push(new Error('Passwords must match.'))
  }
  if (!firstName) {
    errors.push(new Error('First name required.'))
  }
  if (!lastName) {
    errors.push(new Error('Last name required.'))
  }
  if (!street) {
    errors.push(new Error('Street address required.'))
  }
  if (!city) {
    errors.push(new Error('city required.'))
  }
  if (!state) {
    errors.push(new Error('State required.'))
  }
  if (!zipcode) {
    errors.push(new Error('Zipcode required.'))
  }
  if (!phone) {
    errors.push(new Error('Phone number required.'))
  }
  if (!dob) {
    errors.push(new Error('Date of birth required.'))
  }
  if (!gender) {
    errors.push(new Error('Gender required.'))
  }
  if (!marital) {
    errors.push(new Error('Marital status required.'))
  }
  if (!race) {
    errors.push(new Error('Race required.'))
  }
  return errors
}
// Validate the Login Form
const validateLogin = (email, password) => {
  let errors = []
  if (!email) {
    errors.push(new Error('email required'))
  }
  if (!password) {
    errors.push(new Error('Password required'))
  }
  return errors
}

export const authentication = {
  namespaced: true,
  state: initialState,
  mutations: {
    loginRequest (state, localUser) {
      state.status = { loggingIn: true }
      state.localUser = localUser
    },
    loginSuccess (state, localUser) {
      state.status = { loggedIn: true }
      state.localUser = localUser
    },
    loginFailure (state) {
      state.status = {}
      state.localUser = null
    },
    logout (state) {
      state.status = {}
      state.localUser = null
    },
    registerRequest (state, localUser) {
      state.status = { registering: true }
      state.localUser = localUser
    },
    registerSuccess (state, localUser) {
      state.status = { loggedIn: true }
      state.localUser = localUser
    },
    registerFailure (state) {
      state.status = {}
      state.localUser = null
    }
  },
  actions: {
    login ({ dispatch, commit }, { email, password }) {
      commit('loginRequest', { email })
      let errors = validateLogin(email, password)
      if (errors.length === 0) {
        userService.login(email, password)
          .then(
            localUser => {
              commit('loginSuccess', localUser)
              if (localUser.role_id === 1)
                router.push('/admin')
              if (localUser.role_id === 2)
                router.push('/dashboard')
              if (localUser.role_id === 3)
                router.push('/doctor-profile')

              dispatch('alert/success', 'Logged In', { root: true })
            },
            error => {
              commit('loginFailure', error)
              dispatch('alert/error', error, { root: true })
            }
          )
      } else {
        commit('loginFailure', errors)
        dispatch('alert/error', errors, { root: true })
      }
    },
    logout ({ dispatch, commit }) {
      userService.logout()
      commit('logout')
      router.push('/')
      dispatch('alert/success', 'Logged Out', { root: true })
    },
    register ({dispatch, commit}, { email, passwordOne, passwordTwo, firstName, middleInit, lastName, street, city, state, zipcode, phone, dob, gender, marital, race }) {
      commit('registerRequest', {email, passwordOne, passwordTwo, firstName, middleInit, lastName, street, city, state, zipcode, phone, dob, gender, marital, race})
      let errors = validateRegistration(email, passwordOne, passwordTwo, firstName, middleInit, lastName, street, city, state, zipcode, phone, dob, gender, marital, race)
      if (errors.length === 0) {
        userService.register(email, passwordOne, firstName, middleInit, lastName, street, city, state, zipcode, phone, dob, gender, marital, race)
          .then(
            localUser => {
              commit('registerSuccess', localUser)
              router.push('/dashboard')
              dispatch('alert/success', 'Account Registered', { root: true })
            },
            error => {
              commit('registerFailure', error)
              dispatch('alert/error', error, { root: true })
            }
          )
      } else {
        commit('registerFailure', errors)
        dispatch('alert/error', errors, { root: true })
      }
    }
  }
}
