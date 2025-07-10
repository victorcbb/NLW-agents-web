import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateRoomRequest } from './types/create-room-request'
import type { CreateRoomResponse } from './types/create-room-response'

export function useCreateRoom() {
  const queryClient = useQueryClient()

  // utiliza 'useMutation' sempre que a requisição envolver uma criação, edição ou remoção. useQuery utiliza para listagem
  return useMutation({
    mutationFn: async (data: CreateRoomRequest) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'content-type': 'Application/json',
        },
        body: JSON.stringify(data),
      })

      const result: CreateRoomResponse = await response.json()

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-rooms'] }) // refaz as queries referenciadas no array
    },
  })
}
