import { useRouter } from 'expo-router';
import { Food } from '@/types/food';

type AppRouter = ReturnType<typeof useRouter>;

type DraftEdit = { editDraftId: string };
type LogEdit = { editMealId: string; editIndex: number };

export const pushFoodEdit = (router: AppRouter, food: Food, target: DraftEdit | LogEdit) => {
  if (food.dataSource === 'custom') {
    if ('editDraftId' in target) {
      router.push({ pathname: '/food/custom', params: { editDraftId: target.editDraftId } });
      return;
    }
    router.push({
      pathname: '/food/custom',
      params: { editMealId: target.editMealId, editIndex: String(target.editIndex) },
    });
    return;
  }
  if ('editDraftId' in target) {
    router.push({
      pathname: '/food/[id]',
      params: { id: food.id, editDraftId: target.editDraftId },
    });
    return;
  }
  router.push({
    pathname: '/food/[id]',
    params: {
      id: food.id,
      editMealId: target.editMealId,
      editIndex: String(target.editIndex),
    },
  });
};
