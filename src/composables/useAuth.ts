import { useGetCurrentUser, useLogin } from '@/api/auth/auth/auth'
import { ModelsUserRole, type ApiUserResponse } from '@/api/auth/model'
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
const user = ref<ApiUserResponse | null>(null)
const isAuthenticating = ref(false)

export function useAuth() {
  const router = useRouter()
  const loginMutation = useLogin()

  const isAuthenticated = computed(() => !!token.value)
  const hasUser = computed(() => !!user.value)

  const isAuthorized = computed(() => {
    if (!user.value?.role) return false
    return (
      user.value.role === ModelsUserRole.RoleEmployee ||
      user.value.role === ModelsUserRole.RoleAdmin
    )
  })

  const isAdmin = computed(() => {
    return user.value?.role === ModelsUserRole.RoleAdmin
  })

  const userQuery = useGetCurrentUser({
    query: {
      enabled: computed(() => !!token.value && !user.value),
      retry: false,
      staleTime: Infinity,
    },
  })

  // Sync query data to user ref
  watchEffect(() => {
    if (userQuery.data.value && !user.value) {
      user.value = userQuery.data.value
    }
  })

  async function login(email: string, password: string): Promise<void> {
    try {
      isAuthenticating.value = true

      const response = await loginMutation.mutateAsync({ data: { email, password } })
      const tokenData = response

      if (!tokenData.access_token) {
        throw new Error('No access token received')
      }

      token.value = tokenData.access_token
      localStorage.setItem(TOKEN_KEY, tokenData.access_token)

      if (tokenData.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refresh_token)
      }

      await fetchCurrentUser()

      if (!isAuthorized.value) {
        logout()
        throw new Error('Access denied. Only employees and admins can access this system.')
      }

      router.push({ name: 'theaters' })
    } catch (error) {
      logout()
      throw error
    } finally {
      isAuthenticating.value = false
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    try {
      const response = await userQuery.refetch()
      if (response.data) {
        user.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    }
  }

  function logout(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    router.push({ name: 'login' })
  }

  function getToken(): string | null {
    return token.value
  }

  return {
    token,
    user,
    isAdmin,
    isAuthenticated,
    hasUser,
    isAuthorized,
    isAuthenticating,

    login,
    logout,
    getToken,
    fetchCurrentUser,
  }
}
