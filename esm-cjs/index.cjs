// // 运行 node index.cjs 会报错
// const { add } = require('./util.mjs')
// async function foo() {
//   console.log(add(1, 2))
// }
// foo()

// 运行 node index.cjs 不会报错
async function foo() {
  const { add } = await import('./util.mjs')
  console.log(add(1, 2))
}
foo()
