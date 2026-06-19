from datetime import datetime

class Task:
    #1つのタスクが保持するデータ
    def __init__(self, task_id, task_name, start_time, end_time, completed=False):

        self.task_id = task_id
        self.task_name = task_name
        self.start_time = start_time
        self.end_time = end_time
        self.completed = completed

    #json変換関数
    def to_dict(self):

        return  {
            "task_id":self.task_id,
            "task_name":self.task_name,
            "start_time":self.start_time,
            "end_time":self.end_time,
            "completed":self.completed
        }

class Daily_Task:
    #日時の抽出と作成したタスクを保存するリスト
    def __init__(self, date):

        self.date = date
        self.tasks = []

    #時間順ソート
    def sort_tasks(self):

        self.tasks.sort(
            key=lambda task:
            datetime.strptime(task.start_time, "%H:%M")
        )

    #タスク追加関数
    def add_task(self, task_name, start_time, end_time):

        if not task_name.strip():
            raise ValueError("Task name is empty")
        
        if start_time >= end_time:
            raise ValueError("Start time must be earlier than end time")
        
        if len(self.tasks) == 0:
            task_id = 1
        else:
            task_id = max(task.task_id for task in self.tasks) + 1

        task = Task(task_id, task_name, start_time, end_time)

        self.tasks.append(task)
        self.sort_tasks()

    #タスク削除関数
    def delete_task(self, task_id):

        self.tasks = [
            task for task in self.tasks
            if task.task_id != task_id
        ]

    #タスク編集関数
    def edit_task(self, task_id, new_task_name, new_start_time, new_end_time):

        if new_start_time >= new_end_time:
            raise ValueError("Start time must be earlier than end time")

        for task in self.tasks:

            if task.task_id == task_id:
                task.task_name = new_task_name
                task.start_time = new_start_time
                task.end_time = new_end_time
                break

        self.sort_tasks()

    #チェックボックス操作関数
    def check_box(self, task_id):

        for task in self.tasks:

            if task.task_id == task_id:

                task.completed = not task.completed
                break

    #総タスク数カウント関数
    def count_task(self):

        return len(self.tasks)
    
    #完了タスク数カウント関数
    def completed_count(self):

        return len([
            task for task in self.tasks
            if task.completed
        ])
    
    #未完了タスク数カウント関数
    def uncompleted_count(self):

        return self.count_task() - self.completed_count()

    #達成率算出関数
    def achievement_rate(self):

        total = self.count_task()

        if total == 0:
            return 0
        
        rate = (self.completed_count() / total) * 100
        return round(rate, 1)
    
    #Reactへ渡すjsonデータ関数
    def get_tasks_data(self):
        
        return [task.to_dict() for task in self.tasks]
    
class CalendarManager:

    def __init__(self):

        # 日付ごとのDailyTaskを保存
        self.daily_tasks = {}

    # 指定日付取得関数
    def get_daily_task(self, date):

        # 未作成なら自動生成
        if date not in self.daily_tasks:

            self.daily_tasks[date] = Daily_Task(date)

        return self.daily_tasks[date]
    
    # 週データ取得
    def get_week_tasks(self, dates):

        result = {}

        for date in dates:

            daily_task = self.get_daily_task(date)

            result[date] = {
                "tasks": daily_task.get_tasks_data(),
                "achievement_rate":
                    daily_task.achievement_rate(),
                "completed_task":
                    daily_task.completed_count(),
                "uncompleted_task":
                    daily_task.uncompleted_count()
            }

        return result