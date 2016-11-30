const isMaybe = Symbol('isMaybe')

export const nothing = {
  [isMaybe]: true,
  val: (defaultValue) => defaultValue,
  map: () => nothing,
  then: () => nothing,
}

const maybe = (val) => {
  const value = val

  if (value === null || value === undefined) return nothing

  return {
    [isMaybe]: true,
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
      const functionArg = typeof fn === 'function'
      const result = functionArg
      ? fn(value)
      : maybe(value[fn])
      if (functionArg && !result) console.log(result, fn, value)
      if (functionArg && !result.hasOwnProperty(isMaybe)) throw new Error('A function passed to then must return a maybe-value.')

      return fns.length
      ? result.then(...fns)
      : result
    },
  }
}
export default maybe

export const filterMap = (callback, array) => {
  const result = []
  for (let i = 0; i < array.length; i += 1) {
    const maybeElement = callback(array[i], i)
    if (maybeElement !== nothing) array.push(maybeElement.val())
  }
  return result
}
