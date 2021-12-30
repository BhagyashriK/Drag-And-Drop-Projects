namespace App {
  //autobind decorator
  export function Autobind(
    target: any,
    methodName: string,
    decscriptor: PropertyDescriptor
  ) {
    const orignalMethod = decscriptor.value;
    const newDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const boundFn = orignalMethod.bind(this);
        return boundFn;
      },
    };
    return newDescriptor;
  }
}
