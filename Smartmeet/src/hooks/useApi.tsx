"use client"

import { useState, useEffect } from "react"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export const useApi = <T,>(apiCall: () => Promise<T>, dependencies: any[] = []) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const result = await apiCall()

        if (isMounted) {
          setState({
            data: result,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          })
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  const refetch = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiCall()
      setState({
        data: result,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    }
  }

  return {
    ...state,
    refetch,
  }
}
