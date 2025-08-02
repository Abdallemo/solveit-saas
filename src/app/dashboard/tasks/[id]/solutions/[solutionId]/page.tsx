import SolutionPageComps from '@/features/tasks/components/solutionPageComps'
import React from 'react'

export default async function SolutionPage({params}:{params:Promise<{solutionId:string}>}) {
  const {solutionId} = await params
  return (
    <SolutionPageComps/>
  )
}
