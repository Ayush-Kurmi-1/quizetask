import { useEffect, useReducer } from 'react'
import assessmentQuestions from './data/assessmentQuestions.json'

const STORAGE_KEY = 'assessment-app-state'
const TOTAL_TIME = 10 * 60

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function createInitialState() {
  return {
    questions: assessmentQuestions,
    currentQuestion: 0,
    userAnswers: {},
    timer: TOTAL_TIME,
    status: 'home',
  }
}

function getInitialState() {
  if (typeof window === 'undefined') {
    return createInitialState()
  }

  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return createInitialState()
  }

  try {
    const data = JSON.parse(saved)
    const questions = Array.isArray(data.questions) && data.questions.length ? data.questions : assessmentQuestions

    return {
      questions,
      currentQuestion: Number.isFinite(data.currentQuestion) ? data.currentQuestion : 0,
      userAnswers: data.userAnswers && typeof data.userAnswers === 'object' ? data.userAnswers : {},
      timer: Number.isFinite(data.timer) ? data.timer : TOTAL_TIME,
      status: ['home', 'quiz', 'result'].includes(data.status) ? data.status : 'home',
    }
  } catch {
    return createInitialState()
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        currentQuestion: 0,
        userAnswers: {},
        timer: TOTAL_TIME,
        status: 'quiz',
      }
    case 'ANSWER':
      return {
        ...state,
        userAnswers: {
          ...state.userAnswers,
          [action.questionId]: action.answer,
        },
      }
    case 'NEXT':
      return {
        ...state,
        currentQuestion: Math.min(state.currentQuestion + 1, state.questions.length - 1),
      }
    case 'PREVIOUS':
      return {
        ...state,
        currentQuestion: Math.max(state.currentQuestion - 1, 0),
      }
    case 'TICK':
      if (state.timer <= 1) {
        return {
          ...state,
          timer: 0,
          status: 'result',
        }
      }

      return {
        ...state,
        timer: state.timer - 1,
      }
    case 'SUBMIT':
      return {
        ...state,
        status: 'result',
      }
    case 'RESTART':
      return createInitialState()
    default:
      return state
  }
}

export default function AssessmentApp() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (state.status !== 'quiz') {
      return undefined
    }

    const timerId = window.setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [state.status])

  const question = state.questions[state.currentQuestion]
  const score = state.questions.filter(
    (item) => state.userAnswers[item.id] === item.correctAnswer,
  ).length
  const percentage = state.questions.length
    ? Math.round((score / state.questions.length) * 100)
    : 0

  function startQuiz() {
    dispatch({ type: 'START' })
  }

  function submitQuiz() {
    dispatch({ type: 'SUBMIT' })
  }

  function restartQuiz() {
    dispatch({ type: 'RESTART' })
  }

  function selectAnswer(answer) {
    dispatch({ type: 'ANSWER', questionId: question.id, answer })
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 overflow-x-hidden">
      {state.status === 'home' ? (
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-4xl items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Assessment App</p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">Simple assessment quiz</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Number of questions</p>
                <p className="mt-2 text-xl font-semibold">{state.questions.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Time limit</p>
                <p className="mt-2 text-xl font-semibold">10 minutes</p>
              </div>
            </div>
            <button
              type="button"
              onClick={startQuiz}
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Start Assessment
            </button>
          </div>
        </div>
      ) : state.status === 'result' ? (
        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Result</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Assessment summary</h1>
            </div>
            <button
              type="button"
              onClick={restartQuiz}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Restart Assessment
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Score</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{score}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total questions</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{state.questions.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Percentage</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{percentage}%</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Quiz</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Assessment App</h1>
              <p className="mt-1 text-sm text-slate-500">
                Question {state.currentQuestion + 1} of {state.questions.length}
              </p>
            </div>
            <div className="rounded-xl bg-blue-600 px-4 py-3 text-center text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Timer</p>
              <p className="mt-1 text-2xl font-semibold">{formatTime(state.timer)}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-lg font-semibold leading-8 text-slate-900 break-words">
              {question.question}
            </p>

            <div className="mt-5 grid gap-3">
              {question.options.map((option) => {
                const isSelected = state.userAnswers[question.id] === option

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAnswer(option)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition sm:text-base ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => dispatch({ type: 'PREVIOUS' })}
              disabled={state.currentQuestion === 0}
              className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-32"
            >
              Previous
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => dispatch({ type: 'NEXT' })}
                disabled={state.currentQuestion === state.questions.length - 1}
                className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-32"
              >
                Next
              </button>
              <button
                type="button"
                onClick={submitQuiz}
                className="rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 sm:min-w-32"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
