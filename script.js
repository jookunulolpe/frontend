let tasks = [];

// ดึง Element จากหน้าจอ
const taskListElement = document.querySelector('#taskList');
const taskForm = document.querySelector('#taskForm');
const taskInput = document.querySelector('#taskInput');
const priorityInput = document.querySelector('#priorityInput');

// 1. ปรับเปลี่ยนโค้ดฟังก์ชัน addTask ให้ส่งข้อมูลไป Backend (POST)
const addTask = async (title, priority) => {
  try {
    await fetch('http://127.0.0.1:3000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // ต้องบอกเซิร์ฟเวอร์ว่าส่ง JSON ไป
      },
      body: JSON.stringify({ title: title, priority: priority }) // แพ็คของลงกล่อง
    });
    // เมื่อเพิ่มที่ Backend เสร็จ สั่งดึงข้อมูลล่าสุดมาวาดใหม่
    fetchTasks();
  } catch (error) {
    console.error("เพิ่มงานไม่สำเร็จ:", error);
  }
};

// 2. ปรับเปลี่ยนโค้ดฟังก์ชัน toggleTaskStatus ให้เปลี่ยนสถานะที่ Backend (PUT)
const toggleTaskStatus = async (id) => {
  try {
    await fetch(`http://127.0.0.1:3000/tasks/${id}`, {
      method: 'PUT'
    });
    fetchTasks(); // ดึงข้อมูลใหม่
  } catch (error) {
    console.error("เปลี่ยนสถานะไม่สำเร็จ:", error);
  }
};

// 3. ปรับเปลี่ยนโค้ดฟังก์ชัน deleteTask ให้ลบข้อมูลที่ Backend (DELETE)
const deleteTask = async (id) => {
  try {
    await fetch(`http://127.0.0.1:3000/tasks/${id}`, {
      method: 'DELETE'
    });
    fetchTasks(); // ดึงข้อมูลใหม่
  } catch (error) {
    console.error("ลบงานไม่สำเร็จ:", error);
  }
};

// 4. แก้ไขการดึงข้อมูลและแปลงโครงสร้าง id กับ priority
const fetchTasks = async () => {
  try {
    taskListElement.innerHTML = "<h3 style='text-align: center;'> กำลังดึงข้อมูลจากเซิร์ฟเวอร์...</h3>";
    
    // เปลี่ยน URL ไปที่เซิร์ฟเวอร์ Backend
    const response = await fetch('http://127.0.0.1:3000/tasks');
    const data = await response.json();
    
    tasks = data.map(item => {
      return {
        id: item._id, // แก้เป็น _id ตามฐานข้อมูล MongoDB
        title: item.title,
        completed: item.completed,
        priority: item.priority || "low" // กำหนดค่าเริ่มต้นถ้าไม่มี
      };
    });
    
    renderTasks();
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    taskListElement.innerHTML = "<h3 style='text-align: center; color: red;'> ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่</h3>";
  }
};

const renderTasks = () => {
  if (tasks.length === 0) {
    taskListElement.innerHTML = "<p> เยี่ยมมาก! ไม่มีงานค้างเลย</p>";
    return;
  }

  const htmlString = tasks.map(task => {
    const textStyle = task.completed ? "text-decoration: line-through; color: gray;" : "";
    
    return `
      <div class="task-card">
        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- 5. เพิ่มเครื่องหมาย Single Quote (' ') ครอบ ${task.id} -->
          <input type="checkbox" onchange="handleToggle('${task.id}')" ${task.completed ? 'checked' : ''}>
          <span style="${textStyle}">${task.title} <small>(${task.priority})</small></span>
        </div>
        <!-- 5. เพิ่มเครื่องหมาย Single Quote (' ') ครอบ ${task.id} -->
        <button onclick="handleDelete('${task.id}')" style="color: red; cursor: pointer;">ลบ</button>
      </div>
    `;
  }).join(''); 

  taskListElement.innerHTML = htmlString;
};

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newTitle = taskInput.value;
  const newPriority = priorityInput.value;

  addTask(newTitle, newPriority);
  // 6. ลบคำสั่ง renderTasks() ออก
  taskInput.value = '';
});

const handleDelete = (id) => {
  if (confirm("คุณแน่ใจหรือไม่ที่จะลบงานนี้?")) {
    deleteTask(id);
    // 6. ลบคำสั่ง renderTasks() ออก
  }
};

const handleToggle = (id) => {
  toggleTaskStatus(id);
  // 6. ลบคำสั่ง renderTasks() ออก
};

fetchTasks();