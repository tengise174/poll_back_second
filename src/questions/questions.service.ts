import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Question } from './question.entity';
import { OptionsService } from 'src/options/options.service';
import { Poll } from 'src/polls/poll.entity';
import { DeleteQuestionsDto } from './dto/delete-questions.dto';
import { Answer } from 'src/answers/answers.entity';
import { QuestionDto } from './dto/question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    private optionService: OptionsService,
  ) {}

  async createQuestion(
    poll: Poll,
    questionDto: QuestionDto,
  ): Promise<Question> {

    if (!poll.id) {
      throw new Error('Poll must have a valid ID');
    }

    const question = this.questionRepository.create({
      content: questionDto.content,
      questionType: questionDto.questionType,
      minAnswerCount: questionDto.minAnswerCount,
      rateType: questionDto.rateType,
      rateNumber: questionDto.rateNumber,
      order: questionDto.order,
      required: questionDto.required,
      isPointBased: questionDto.isPointBased,
      hasCorrectAnswer: questionDto.hasCorrectAnswer,
      poster: questionDto.poster,
      gridRows: questionDto.gridRows,
      gridColumns: questionDto.gridColumns,
      minValue: questionDto.minValue,
      maxValue: questionDto.maxValue,
      minLabel: questionDto.minLabel,
      maxLabel: questionDto.maxLabel,
      poll,
    });

    const savedQuestion = await this.questionRepository.save(question);

    if (questionDto.options && questionDto.options.length > 0) {
      for (const optionDto of questionDto.options) {
        await this.optionService.createOption(optionDto, savedQuestion);
      }
    }

    return await this.questionRepository.findOne({
      where: { id: savedQuestion.id },
      relations: ['options'],
    });
  }

  async updateQuestion(
    questionId: string,
    questionDto: QuestionDto,
  ): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['options', 'poll'],
    });

    if (!question) {
      throw new Error(`Question with ID ${questionId} not found`);
    }

    question.content = questionDto.content ?? question.content;
    question.questionType = questionDto.questionType ?? question.questionType;
    question.minAnswerCount = questionDto.minAnswerCount ?? question.minAnswerCount;
    question.rateType = questionDto.rateType ?? question.rateType;
    question.rateNumber = questionDto.rateNumber ?? question.rateNumber;
    question.order = questionDto.order ?? question.order;
    question.required = questionDto.required ?? question.required;
    question.isPointBased = questionDto.isPointBased ?? question.isPointBased;
    question.hasCorrectAnswer = questionDto.hasCorrectAnswer ?? question.hasCorrectAnswer;
    question.poster = questionDto.poster ?? question.poster;
    question.gridRows = questionDto.gridRows ?? question.gridRows;
    question.gridColumns = questionDto.gridColumns ?? question.gridColumns;
    question.minValue = questionDto.minValue ?? question.minValue;
    question.maxValue = questionDto.maxValue ?? question.maxValue;
    question.minLabel = questionDto.minLabel ?? question.minLabel;
    question.maxLabel = questionDto.maxLabel ?? question.maxLabel;


    const savedQuestion = await this.questionRepository.save(question);

    if (questionDto.options) {
      const optionIdsInRequest = questionDto.options
        .filter((o) => o.id && o.id !== null)
        .map((o) => o.id);
      const optionsToDelete = question.options.filter(
        (o) => !optionIdsInRequest.includes(o.id),
      );

      for (const option of optionsToDelete) {
        await this.optionService.deleteOption(option.id);
      }

      for (const optionDto of questionDto.options) {
        if (optionDto.id && optionDto.id !== null) {
          await this.optionService.updateOption(optionDto.id, optionDto);
        } else {
          await this.optionService.createOption(optionDto, question);
        }
      }
    }

    return await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['options', 'poll'],
    });
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

  async deleteQuestionsByPoll(poll: Poll): Promise<void> {
    const questions = await this.questionRepository.find({
      where: { poll: { id: poll.id } },
    });
    await this.questionRepository.remove(questions);
  }
}
