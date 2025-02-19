import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RecordService } from './record.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('records')
@UseGuards(AuthGuard())
export class RecordController {
  constructor(private recordService: RecordService) {}

  @Post()
  async createRecords(
    @GetUser() user: User,
    @Body() createRecordsDto: CreateRecordDto[],
  ) {
    return this.recordService.createRecords(user, createRecordsDto);
  }
}
