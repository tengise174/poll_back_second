import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { QuestionsModule } from './questions/questions.module';
import { OptionsModule } from './options/options.module';
import { PollsModule } from './polls/polls.module';
import { AnswersModule } from './answers/answers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        // host: configService.get('DB_HOST'),
        // port: parseInt(configService.get('DB_PORT'), 10),
        // username: configService.get('DB_USERNAME'),
        // password: configService.get('DB_PASSWORD'),
        // database: configService.get('DB_DATABASE'),
        url: configService.get('DATABASE_URL'),
      }),
    }),
    AuthModule,
    QuestionsModule,
    OptionsModule,
    PollsModule,
    AnswersModule,
  ],
})
export class AppModule {}
