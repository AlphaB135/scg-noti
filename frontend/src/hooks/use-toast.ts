"use client"

// Inspired by react-hot-toast library
import * as React from "react"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// เปลี่ยนจาก const actionTypes เป็น enum
enum ActionTypes {
  ADD_TOAST     = "ADD_TOAST",
  UPDATE_TOAST  = "UPDATE_TOAST",
  DISMISS_TOAST = "DISMISS_TOAST",
  REMOVE_TOAST  = "REMOVE_TOAST",
}

type Action =
  | { type: ActionTypes.ADD_TOAST;     toast: ToasterToast }
  | { type: ActionTypes.UPDATE_TOAST;  toast: Partial<ToasterToast> }
  | { type: ActionTypes.DISMISS_TOAST; toastId?: string }
  | { type: ActionTypes.REMOVE_TOAST;  toastId?: string }

interface State {
  toasts: ToasterToast[]
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: ActionTypes.REMOVE_TOAST, toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case ActionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case ActionTypes.DISMISS_TOAST: {
      const { toastId } = action
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((t) => addToRemoveQueue(t.id))
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      }
    }

    case ActionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// global state & listeners
const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((fn) => fn(memoryState))
}

type Toast = Omit<ToasterToast, "id">

export function toast({ ...props }: Toast) {
  const id = genId()

  const update = (data: ToasterToast) =>
    dispatch({ type: ActionTypes.UPDATE_TOAST, toast: { ...data, id } })
  const dismiss = () =>
    dispatch({ type: ActionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: ActionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return { id, dismiss, update }
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const i = listeners.indexOf(setState)
      if (i > -1) listeners.splice(i, 1)
    }
  }, [])

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: ActionTypes.DISMISS_TOAST, toastId }),
  }
}
