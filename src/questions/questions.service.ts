import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Question } from './question.entity';
import { OptionsService } from 'src/option/options.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Poll } from 'src/polls/poll.entity';
import { DeleteQuestionsDto } from './dto/delete-questions.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private optionService: OptionsService,
  ) {}

  async createQuestion(
    poll: Poll,
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    const question = this.questionRepository.create(createQuestionDto);
    question.poll = poll;
    const savedQuestion = await this.questionRepository.save(question);
    question.options.map((dto) =>
      this.optionService.createOption(dto, savedQuestion),
    );
    return savedQuestion;
  }

  async deleteQuestion(questionId: string) {
    const question = await this.questionRepository.find({
      where: { id: questionId },
    });
    this.questionRepository.remove(question);
  }

  async getQuestions(poll: Poll): Promise<Question[]> {
    return this.questionRepository.find({
      where: { poll: poll },
      relations: ['options'],
    });
  }

  async deleteQuestions(deleteQuestionsDto: DeleteQuestionsDto) {
    const { ids } = deleteQuestionsDto;

    const questions = await this.questionRepository.find({
      where: {
        id: In(ids),
      },
    });

    this.questionRepository.remove(questions);
  }
}
