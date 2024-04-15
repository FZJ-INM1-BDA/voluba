import { Pipe, PipeTransform } from "@angular/core";
import { HistoryStack } from "./const";

type ActiveHistoryStack = {
  histories: HistoryStack[]
  visibleHistories: HistoryStack[]
  hiddenRecentHistories: HistoryStack[]
  hiddenAncientHistories: HistoryStack[]
  recentCount: number
  ancientCount: number
}

@Pipe({
  name: 'extractActiveHistory',
  pure: true
})
export class ExtractActiveHistoryPipe implements PipeTransform{
  transform(histories: HistoryStack[], before: number=1, after: number=4): ActiveHistoryStack {
    const activeIndex = histories.findIndex(history => !!history.active)
    const beforeIndex = Math.max(0, activeIndex - before)
    const afterIndex = Math.min(histories.length, activeIndex + after)
    return {
      histories,
      visibleHistories: histories.slice(beforeIndex, afterIndex),
      hiddenRecentHistories: histories.slice(0, beforeIndex),
      hiddenAncientHistories: histories.slice(afterIndex),
      recentCount: activeIndex < 0 ? 0 : activeIndex,
      ancientCount: activeIndex < 0 ? 0 : histories.length - activeIndex - 1,
    }
  }
}
