import { SolutionReturnErrorType } from "../server/task-types"

export class SolutionError extends Error{
  constructor(public code:SolutionReturnErrorType){
    super(code)
    this.name = "SolutionError"
  }
}
