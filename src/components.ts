import RoopComponent from './components/RoopComponent'
let components = [RoopComponent]


export default (FactoryFn: any) =>
{
  return components.map((c) => FactoryFn(c.schema, c.functions))
}




