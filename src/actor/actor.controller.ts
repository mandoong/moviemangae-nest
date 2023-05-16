import { Controller } from '@nestjs/common';
import { ActorService } from './actor.service';

@Controller()
export class ActorController {
  constructor(private actorService: ActorService) {}
}
