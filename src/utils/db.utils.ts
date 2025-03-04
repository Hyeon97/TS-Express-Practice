export const editDBReturnRow = <T extends Record<string, any>[]>(arr: T) => {
  arr.map(
    (obj) =>
      Object.keys(obj).reduce(
        (acc, key) => ({
          ...acc,
          [key.slice(1)]: obj[key],
        }),
        {}
      ) as { [K in keyof T[number] as K extends `${"n" | "s"}${infer Rest}` ? Rest : K]: T[number][K] }
  )
}
