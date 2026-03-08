import { ResultAsync } from "neverthrow";

export interface ApplicationService<TInput, TOutput = void, E = Error> {
  execute(command: TInput): ResultAsync<TOutput, E>;
}
