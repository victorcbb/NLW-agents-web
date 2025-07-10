import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateQuestionRequest } from './types/create-question-request'
import type { CreateQuestionResponse } from './types/create-question-response'

export function useCreateQuestion(roomId: string) {
  const queryClient = useQueryClient()

  // utiliza 'useMutation' sempre que a requisição envolver uma criação, edição ou remoção. useQuery utiliza para listagem
  return useMutation({
    mutationFn: async (data: CreateQuestionRequest) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/rooms/${roomId}/questions`,
        {
          method: 'POST',
          headers: {
            'content-type': 'Application/json',
          },
          body: JSON.stringify(data),
        }
      )

      const result: CreateQuestionResponse = await response.json()

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-questions', roomId] }) // refaz as queries referenciadas no array
    },
  })
}
