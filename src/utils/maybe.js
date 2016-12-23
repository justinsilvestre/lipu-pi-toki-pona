// @flow

type MapFn<X> = (arg: X) => *
type ThenFn<X> = (arg: X) => Maybe<*>

type Maybe<X> = {
  val: (defaultValue: *) => X | *,
  map: (...fns: Array<(string | MapFn<X>)>) => Maybe<*>,
  then: (...fns: Array<(string | ThenFn<X>)>) => Maybe<*>,
}

export const nothing : Maybe<*> = {
  val: (defaultValue) => defaultValue,
  map: () => nothing,
  then: () => nothing,
}

const maybe = (val: *) : Maybe<*> => {
  const value = val

  if (value === null || value === undefined) return nothing

  return {
    val: () => value,
    map: (fn, ...fns) => {
      const result = maybe(typeof fn === 'function'
        ? fn(value)
        : value[fn]
      )

      return fns.length
        ? result.map(...fns)
        : result
    },
    then: (fn, ...fns) => {
      const result = typeof fn === 'function'
      ? fn(value)
      : maybe(value[fn])
      if (typeof fn === 'function' && !result) console.log(result, fn, value)

      return fns.length
      ? result.then(...fns)
      : result
    },
  }
}
export default maybe

export const filterMap = (callback: Function, array: Array<*>) : Array<*> => {
  const result = []
  for (let i = 0; i < array.length; i += 1) {
    const maybeElement = callback(array[i], i)
    if (maybeElement !== nothing) array.push(maybeElement.val())
  }
  return result
}
