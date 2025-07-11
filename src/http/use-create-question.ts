import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateQuestionRequest } from './types/create-question-request'
import type { CreateQuestionResponse } from './types/create-question-response'
import type { GetRoomQuestionsResponse } from './types/get-room-questions-response'

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
    //executa no momento em que for feita a chamada a API
    onMutate({ question }) {
      const questions = queryClient.getQueryData<GetRoomQuestionsResponse>([
        'get-questions',
        roomId,
      ])
      const questionsArray = questions ?? []

      const newQuestion = {
        id: crypto.randomUUID(),
        question,
        answer: null,
        createdAt: new Date().toISOString(),
        isGeneratingAnswer: true,
      }

      queryClient.setQueryData<GetRoomQuestionsResponse>(
        ['get-questions', roomId],
        [newQuestion, ...questionsArray]
      )

      return { newQuestion, questions }
    },
    onSuccess(data, _variables, context) {
      queryClient.setQueryData<GetRoomQuestionsResponse>(
        ['get-questions', roomId],
        (questions) => {
          if (!(questions && context.newQuestion)) {
            return questions
          }

          return questions.map((question) => {
            if (question.id === context.newQuestion.id) {
              return {
                ...context.newQuestion,
                id: data.questionId,
                answer: data.answer,
                isGeneratingAnswer: false,
              }
            }
            return question
          })
        }
      )
    },
    onError(_error, _variables, context) {
      if (context?.questions) {
        queryClient.setQueryData<GetRoomQuestionsResponse>(
          ['get-questions', roomId],
          context.questions
        )
      }
    },
    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ['get-questions', roomId] }) // refaz as requisições referenciadas no array
    // },
  })
}
