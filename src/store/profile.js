import { profileService } from '../services'
import { router } from '../router'

const initialState = {
  profileStatus: {},
  userProfile: {
    firstName: '',
    lastName: '',
    addressOne: '',
    addressTwo: '',
    city: '',
    state: '',
    zipcode: ''
  }
}

// Validate the Profile Form
const validateProfile = profile => {
  const {
    firstName,
    lastName,
    addressOne,
    city,
    state,
    zipcode
  } = profile
  let errors = []
  if (!firstName) {
    errors.push(new Error('First name required'))
  }
  if (!lastName) {
    errors.push(new Error('Last name required'))
  }
  if (lastName.length + firstName.length > 50) {
    errors.push(new Error('Fill name Exceeds Limit: 50'))
  }
  if (!addressOne) {
    errors.push(new Error('Address required'))
  }
  if (!city) {
    errors.push(new Error('City required'))
  }
  if (!state) {
    errors.push(new Error('State required'))
  }
  if (!zipcode) {
    errors.push(new Error('Zipcode required'))
  }
  return errors
}

const checkComplete = (profile) => {
  let complete = true
  for (let [key, value] of Object.entries(profile)) {
    if (key !== 'addressTwo' && value.length === 0) {
      complete = false
    }
  }
  return complete
}

export const profile = {
  namespaced: true,
  state: initialState,
  mutations: {
    loadProfileRequest (state) {
      state.profileStatus = { loadingProfile: true }
      state.userProfile = state.initialState
    },
    loadingProfileSuccess (state, profile) {
      state.profileStatus = {
        loadedProfile: true,
        profileComplete: checkComplete(profile)
      }
      state.userProfile = profile
    },
    loadingProfileFailure (state) {
      state.profileStatus = {}
      state.userProfile = initialState
    },
    loadedProfileEmpty (state, profile) {
      state.profileStatus = {
        loadedProfile: true,
        profileComplete: true
      }
    },
    createProfileRequest (state, submittedProfile) {
      state.profileStatus = { creatingProfile: true }
      state.userProfile = submittedProfile
    },
    createProfileSuccess (state, returnedProfile) {
      state.profileStatus = {
        createdProfile: true,
        profileComplete: checkComplete(profile)
      }
      state.userProfile = returnedProfile
    },
    createProfileFailure (state, submittedProfile) {
      state.profileStatus = { createProfileFailure: true }
    },
    updateProfileRequest (state, submittedProfile) {
      state.profileStatus = { updatingProfile: true }
      state.userProfile = submittedProfile
    },
    updateProfileSuccess (state, returnedProfile) {
      state.profileStatus = {
        updatedProfile: true,
        profileComplete: checkComplete(profile)
      }
      state.userProfile = returnedProfile
    },
    updateProfileFailure (state) {
      state.profileStatus = { updateProfileFailure: true }
    }
  },
  actions: {
    loadProfile ({ dispatch, commit }) {
      commit('loadProfileRequest')
      // Call To Profile Service Here
      profileService.getProfile().then(
        response => {
          const profile = response.profile
          if (!profile.state) {
            commit('loadingProfileSuccess', profile)
            router.push('/profile')
            dispatch('alert/success', 'Profile Empty', { root: true })
          } else {
            commit('loadingProfileSuccess', profile)
            dispatch('alert/success', 'Profile Loaded', { root: true })
          }
        },
        error => {
          commit('loadingProfileFailure')
          dispatch('alert/error', error, { root: true })
        }
      )
    },
    createProfile ({ dispatch, commit }, profile) {
      commit('createProfileRequest', profile)
      const validationErrors = validateProfile(profile)
      if (validationErrors.length > 0) {
        commit('createProfileFailure')
        dispatch('alert/error', validationErrors, { root: true })
      } else {
        profileService.postProfile(profile).then(
          response => {
            commit('createProfileSuccess', response.profile)
            router.push('/quote')
            dispatch('alert/success', 'Profile Created', { root: true })
          },
          error => {
            commit('createProfileFailure')
            dispatch('alert/error', error, { root: true })
          }
        )
      }
    },
    updateProfile ({ dispatch, commit }, profile) {
      commit('updateProfileRequest', profile)
      const validationErrors = validateProfile(profile)
      if (validationErrors.length > 0) {
        commit('updateProfileFailure')
        dispatch('alert/error', validationErrors, { root: true })
      } else {
        profileService.putProfile(profile).then(
          response => {
            commit('updateProfileSuccess', response.profile)
            dispatch('alert/success', 'Profile Updated', { root: true })
          },
          error => {
            commit('updateProfileFailure')
            dispatch('alert/error', error, { root: true })
          }
        )
      }
    }
  }
}