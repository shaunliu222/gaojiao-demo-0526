import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  Wrench,
  Sparkles,
  X,
  Monitor,
  Printer,
  Package,
  Layers,
  Box,
  Cpu,
  Hammer,
} from "lucide-react";
import { AiBadge } from "../Layout";
import {
  hardwareDevices,
  deviceUsageByStudent,
  type HardwareDevice,
  type DeviceStatus,
} from "../../data/studentMock";

function deviceIcon(category: string) {
  if (category.includes("三维")) return Monitor;
  if (category.includes("二维")) return Layers;
  if (category.includes("增材") || category.includes("3D")) return Printer;
  if (category.includes("虚拟")) return Box;
  if (category.includes("减材") || category.includes("激光")) return Hammer;
  if (category.includes("实体")) return Package;
  return Cpu;
}

function deviceStatusMeta(s: DeviceStatus): {
  label: string;
  tone: string;
  dot: string;
} {
  switch (s) {
    case "online_idle":
      return {
        label: "空闲可预约",
        tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "in_use":
      return {
        label: "使用中",
        tone: "bg-indigo-50 text-indigo-700 border-indigo-200",
        dot: "bg-indigo-500",
      };
    case "maintenance":
      return {
        label: "维护中",
        tone: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
      };
    case "offline":
      return {
        label: "离线",
        tone: "bg-slate-100 text-slate-500 border-slate-200",
        dot: "bg-slate-400",
      };
  }
}

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="text-slate-900 text-[0.9375rem]">{title}</h2>
      {hint && <div className="text-slate-400 text-[0.75rem]">{hint}</div>}
    </div>
  );
}

function DrawerRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{k}</span>
      <span className="text-slate-800">{children}</span>
    </div>
  );
}

function DeviceDrawer({
  device,
  studentId,
  onClose,
}: {
  device: HardwareDevice;
  studentId: string;
  onClose: () => void;
}) {
  const meta = deviceStatusMeta(device.status);
  const Icon = deviceIcon(device.category);
  const recentUsage = (deviceUsageByStudent[studentId] ?? []).filter(
    (u) => u.deviceId === device.id,
  );

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-slate-900/30" onClick={onClose} />
      <div className="w-[min(27.5rem,88vw)] bg-white h-full shadow-2xl overflow-auto">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
            <Icon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-900">{device.name}</div>
            <div className="text-slate-500 text-[0.75rem]">{device.category}</div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div
            className={`px-3 py-2 rounded-lg border text-[0.8125rem] ${meta.tone} inline-flex items-center gap-2`}
          >
            <span className={`size-2 rounded-full ${meta.dot}`} />
            {meta.label}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-[0.8125rem]">
            <DrawerRow k="位置">
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {device.location}
              </span>
            </DrawerRow>
            {device.bookableAt && (
              <DrawerRow k="下一个可约">
                <span className="text-indigo-700 inline-flex items-center gap-1">
                  <Calendar size={12} /> {device.bookableAt}
                </span>
              </DrawerRow>
            )}
            {device.currentUser && <DrawerRow k="当前使用者">{device.currentUser}</DrawerRow>}
          </div>

          <div>
            <div className="text-slate-500 mb-2">可训练技能</div>
            <div className="flex flex-wrap gap-1">
              {device.skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-slate-500 mb-2">设备介绍</div>
            <p className="text-slate-700 leading-relaxed">{device.description}</p>
          </div>

          <div>
            <div className="text-slate-500 mb-2">我的使用记录</div>
            {recentUsage.length === 0 ? (
              <div className="text-slate-400 text-[0.8125rem]">暂无使用记录</div>
            ) : (
              <ul className="space-y-2">
                {recentUsage.map((u, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg border border-slate-200 p-3 flex justify-between items-start gap-2"
                  >
                    <div>
                      <div className="text-slate-900">{u.task}</div>
                      <div className="text-slate-500 text-[0.75rem] mt-0.5">
                        {u.startedAt.slice(0, 16).replace("T", " ")} · {u.durationMinutes} 分钟
                      </div>
                    </div>
                    {u.score !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[0.75rem] ${
                          u.score >= 85
                            ? "bg-emerald-50 text-emerald-700"
                            : u.score >= 70
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {u.score}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AiBadge>AI 操作提示</AiBadge>
            </div>
            <p className="text-slate-700 leading-relaxed text-[0.8125rem]">
              {device.category.includes("三维")
                ? "建议先 Ctrl+Shift+A 开启「实时评估」，AI 会在建模时提示约束遗漏。"
                : device.category.includes("实体")
                  ? "带一支铅笔和 A4 纸过来，先摆实体、再自己画一张三视图、最后扫码对照视频讲解。"
                  : device.category.includes("3D")
                    ? "提交 STL 前，平台会自动做壁厚和悬空检查，避免打印失败。"
                    : "首次使用请先完成 3 分钟安全须知，平台已帮你缓存课程中的示范流程。"}
            </p>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              加入收藏
            </button>
            <button
              type="button"
              className="py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center justify-center gap-1"
            >
              <Calendar size={14} /> 预约时段
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 实训硬件网格 + 详情抽屉（供实训中心与实训工作台复用） */
export function TrainingDevicesPanel({
  studentId,
  title = "实训硬件接入",
  hint = "AI 已按你的课程进度匹配推荐度",
  pendingOpenDeviceId,
  onPendingOpenHandled,
}: {
  studentId: string;
  title?: string;
  hint?: string;
  /** 外部触发打开某设备详情（如学情横幅「查看模型柜」） */
  pendingOpenDeviceId?: string | null;
  onPendingOpenHandled?: () => void;
}) {
  const [deviceDetailId, setDeviceDetailId] = useState<string | null>(null);
  const deviceDetail = hardwareDevices.find((d) => d.id === deviceDetailId);
  const isWeakStudent = studentId === "s-mech2302-01";

  useEffect(() => {
    if (!pendingOpenDeviceId) return;
    setDeviceDetailId(pendingOpenDeviceId);
    onPendingOpenHandled?.();
  }, [pendingOpenDeviceId, onPendingOpenHandled]);

  return (
    <section>
      <SectionHead title={title} hint={hint} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-3">
        {hardwareDevices.map((d) => {
          const meta = deviceStatusMeta(d.status);
          const Icon = deviceIcon(d.category);
          const isRecommended =
            (isWeakStudent && d.id === "hw-model-01") || (!isWeakStudent && d.id === "hw-3d-01");
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setDeviceDetailId(d.id)}
              className={`text-left bg-white rounded-xl border p-4 hover:shadow-md transition flex flex-col ${
                isRecommended ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-md border text-[0.6875rem] ${meta.tone} inline-flex items-center gap-1`}
                >
                  <span className={`size-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              </div>
              <div className="text-slate-900 mt-3 line-clamp-1">{d.name}</div>
              <div className="text-slate-500 text-[0.75rem] mt-0.5">{d.category}</div>
              <p className="text-slate-500 text-[0.75rem] line-clamp-2 mt-2 leading-relaxed">
                {d.description}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-[0.75rem] text-slate-500">
                <div className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {d.location}
                </div>
                {d.status === "in_use" && d.currentUser && (
                  <div className="inline-flex items-center gap-1">
                    <Wrench size={12} /> 当前：{d.currentUser}
                  </div>
                )}
                {d.bookableAt && d.status !== "maintenance" && (
                  <div className="inline-flex items-center gap-1 text-indigo-600">
                    <Calendar size={12} /> 可约：{d.bookableAt}
                  </div>
                )}
              </div>
              {isRecommended && (
                <div className="mt-2 inline-flex items-center gap-1 text-indigo-700 text-[0.75rem]">
                  <Sparkles size={12} /> AI 为你优先推荐
                </div>
              )}
            </button>
          );
        })}
      </div>
      {deviceDetail && (
        <DeviceDrawer
          device={deviceDetail}
          studentId={studentId}
          onClose={() => setDeviceDetailId(null)}
        />
      )}
    </section>
  );
}
