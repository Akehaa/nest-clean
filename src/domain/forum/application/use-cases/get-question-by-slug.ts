import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionsRepository } from '../repositories/questions-repository';
import { Either, right } from '@/core/either';

interface GetQuestionBySlugUseCaseRequest {
  slug: string;
}

type GetQuestionBySlugUseCaseResponse = Either<
  null,
  {
    question: Question;
  }
>;

export class GetQuestionBySlugUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    slug,
  }: GetQuestionBySlugUseCaseRequest): Promise<GetQuestionBySlugUseCaseResponse> {
    const question = await this.questionsRepository.findBySlug(slug);

    if (!question) {
      throw new Error('Question not found.');
    }

    return right({
      question,
    });
  }
}
