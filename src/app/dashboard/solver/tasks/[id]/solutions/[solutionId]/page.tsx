import SolutionPageComps from '@/features/tasks/components/solutionPageComps'
import { getSolutionById } from '@/features/tasks/server/data'

export default async function SolutionPage({params}:{params:Promise<{solutionId:string}>}) {
  const {solutionId} = await params
  console.log("solution id :",solutionId)
  const solution = await getSolutionById(solutionId)
  return (
    <SolutionPageComps solution={solution}/>
  )
}
